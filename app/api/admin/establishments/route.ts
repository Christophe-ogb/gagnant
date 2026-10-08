import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUser, isSameOrigin } from "@/lib/supabase/api-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { readJsonBody } from "@/lib/security/request-validation";
import type { Establishment } from "@/lib/establishments";

export const dynamic = "force-dynamic";
const moderationSchema = z.object({
  id: z.string().uuid("Identifiant d’établissement invalide."),
  status: z.enum(["approved", "rejected"], "Statut de modération invalide."),
  reason: z.string().trim().max(1000, "Le motif de refus ne peut pas dépasser 1 000 caractères.").optional(),
}).strict().superRefine((payload, context) => {
  if (payload.status === "rejected" && (!payload.reason || payload.reason.length < 5)) {
    context.addIssue({ code: "custom", message: "Le motif de refus doit contenir de 5 à 1 000 caractères.", path: ["reason"] });
  }
});

export async function GET() {
  const access = await getAdminUser();
  if ("response" in access) return access.response;
  const { data, error } = await access.supabase
    .from("establishments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Impossible de charger les établissements pour la modération.", error);
    return NextResponse.json({ error: "Impossible de charger les établissements." }, { status: 503 });
  }

  const establishments = (data ?? []) as Establishment[];
  let photoEntries: readonly (readonly [string, string])[];
  try {
    photoEntries = await Promise.all(establishments.flatMap((establishment) => establishment.photos.map(async (path) => {
      const { data: photo, error: photoError } = await access.supabase.storage
        .from("establishment-photos")
        .createSignedUrl(path, 3600);
      if (photoError) throw photoError;
      return [path, photo.signedUrl] as const;
    })));
  } catch (cause) {
    console.error("Impossible de créer les URL temporaires des photos des fiches.", cause);
    return NextResponse.json({ error: "Impossible de charger les photos des établissements." }, { status: 503 });
  }
  return NextResponse.json({ establishments, photoUrls: Object.fromEntries(photoEntries) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const access = await getAdminUser();
  if ("response" in access) return access.response;

  const limited = await enforceRateLimit(request, {
    key: "admin:establishments-moderation",
    identifier: access.user.id,
    limit: 30,
  });
  if (limited) return limited;

  const parsed = await readJsonBody(request, moderationSchema, {
    maxBytes: 4096,
    invalidMessage: "La demande de modération est invalide.",
  });
  if (!parsed.success) return parsed.response;
  const { id, status, reason = "" } = parsed.data;

  const updates = status === "rejected"
    ? { status, rejection_reason: reason, rejected_at: new Date().toISOString() }
    : { status, rejection_reason: null, rejected_at: null };
  const { data, error } = await access.supabase
    .from("establishments")
    .update(updates)
    .eq("id", id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (error) {
    console.error("Impossible de modérer l’établissement.", error);
    return NextResponse.json({ error: "Impossible de modifier le statut de cette fiche." }, { status: 503 });
  }
  if (!data) return NextResponse.json({ error: "Cette fiche n’est plus en attente de validation." }, { status: 409 });
  return NextResponse.json({ establishment: data }, { headers: { "Cache-Control": "no-store" } });
}
