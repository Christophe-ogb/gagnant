import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser, isSameOrigin } from "@/lib/supabase/api-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { readJsonBody } from "@/lib/security/request-validation";

export const dynamic = "force-dynamic";
const testimonialModerationSchema = z.discriminatedUnion("action", [
  z.object({ id: z.string().uuid("Identifiant de témoignage invalide."), action: z.literal("delete") }).strict(),
  z.object({ id: z.string().uuid("Identifiant de témoignage invalide."), action: z.enum(["publish", "hide"]), currentStatus: z.boolean() }).strict(),
]);

export async function GET() {
  const access = await getAdminUser();
  if ("response" in access) return access.response;
  const { data, error } = await access.supabase
    .from("temoignages")
    .select("id, nom, fonction, temoignage, note, photo_url, affiche, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Impossible de charger les témoignages pour modération.", error);
    return NextResponse.json({ error: "Impossible de charger les témoignages." }, { status: 503 });
  }
  return NextResponse.json({ testimonials: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const access = await getAdminUser();
  if ("response" in access) return access.response;

  const limited = await enforceRateLimit(request, {
    key: "admin:testimonials-moderation",
    identifier: access.user.id,
    limit: 30,
  });
  if (limited) return limited;

  const parsed = await readJsonBody(request, testimonialModerationSchema, {
    maxBytes: 2048,
    invalidMessage: "La demande de modération est invalide.",
  });
  if (!parsed.success) return parsed.response;
  const payload = parsed.data;
  const { id, action } = payload;

  if (action === "delete") {
    const { data, error } = await access.supabase
      .from("temoignages")
      .delete()
      .eq("id", id)
      .select("photo_url")
      .maybeSingle();
    if (error) {
      console.error("Impossible de supprimer le témoignage.", error);
      return NextResponse.json({ error: "Impossible de supprimer ce témoignage." }, { status: 503 });
    }
    if (!data) return NextResponse.json({ error: "Ce témoignage n’existe plus." }, { status: 404 });
    if (data.photo_url) {
      const marker = "/storage/v1/object/public/temoignages/";
      const photoPath = new URL(data.photo_url).pathname.split(marker)[1];
      if (photoPath) {
        const { error: photoError } = await access.supabase.storage.from("temoignages").remove([decodeURIComponent(photoPath)]);
        if (photoError) {
          console.error("Le témoignage a été supprimé, mais sa photo n’a pas pu être supprimée.", photoError);
          return NextResponse.json({ error: "Le témoignage a été supprimé, mais le nettoyage de sa photo a échoué." }, { status: 503 });
        }
      }
    }
    return NextResponse.json({ deleted: true });
  }

  const afficher = action === "publish";
  const { data, error } = await access.supabase
    .from("temoignages")
    .update({ affiche: afficher })
    .eq("id", id)
    .eq("affiche", payload.currentStatus)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("Impossible de mettre à jour le témoignage.", error);
    return NextResponse.json({ error: "Impossible de modérer ce témoignage." }, { status: 503 });
  }
  if (!data) return NextResponse.json({ error: "Ce témoignage a déjà été modéré." }, { status: 409 });
  return NextResponse.json({ affiche: afficher });
}
