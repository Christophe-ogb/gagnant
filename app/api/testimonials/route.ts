import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit, requestRateLimitIdentifier } from "@/lib/security/rate-limit";
import { readFormDataBody } from "@/lib/security/request-validation";
import { isSameOrigin } from "@/lib/supabase/api-auth";

export const dynamic = "force-dynamic";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_BODY_BYTES = MAX_PHOTO_BYTES + 32 * 1024;
const ACCEPTED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const testimonialSchema = z.object({
  nom: z.string().trim().min(1, "Saisissez votre nom.").max(100, "Le nom ne peut pas dépasser 100 caractères."),
  fonction: z.string().trim().min(1, "Saisissez votre fonction.").max(120, "La fonction ne peut pas dépasser 120 caractères."),
  temoignage: z.string().trim().min(20, "Le témoignage doit contenir au moins 20 caractères.").max(1200, "Le témoignage ne peut pas dépasser 1 200 caractères."),
  note: z.coerce.number().int().min(1).max(5),
}).strict();

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });

  const limited = await enforceRateLimit(request, {
    key: "public:testimonial-submission",
    identifier: requestRateLimitIdentifier(request),
    limit: 3,
  });
  if (limited) return limited;

  const parsedFormData = await readFormDataBody(request, MAX_BODY_BYTES);
  if (!parsedFormData.success) return parsedFormData.response;
  const formData = parsedFormData.data;
  const payloadResult = testimonialSchema.safeParse({
    nom: formData.get("nom"),
    fonction: formData.get("fonction"),
    temoignage: formData.get("temoignage"),
    note: formData.get("note"),
  });
  if (!payloadResult.success) {
    return NextResponse.json({ error: payloadResult.error.issues[0]?.message ?? "Vérifiez les informations du témoignage." }, { status: 400 });
  }

  const photoEntry = formData.get("photo");
  if (photoEntry !== null && !(photoEntry instanceof File)) {
    return NextResponse.json({ error: "Le fichier de la photo est invalide." }, { status: 400 });
  }
  const photo = photoEntry instanceof File && photoEntry.size > 0 ? photoEntry : null;
  if (photo && (!ACCEPTED_IMAGE_TYPES.has(photo.type) || photo.size > MAX_PHOTO_BYTES)) {
    return NextResponse.json({ error: "La photo doit être au format JPG, PNG ou WebP et ne pas dépasser 5 Mo." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("La soumission des témoignages nécessite SUPABASE_SERVICE_ROLE_KEY côté serveur.");
    return NextResponse.json({ error: "Le formulaire de témoignage est momentanément indisponible." }, { status: 503 });
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
  let photoPath: string | null = null;
  let photoUrl: string | null = null;

  if (photo) {
    const extension = ACCEPTED_IMAGE_TYPES.get(photo.type);
    if (!extension) return NextResponse.json({ error: "Le format de la photo n’est pas accepté." }, { status: 400 });
    photoPath = `temoignages/${crypto.randomUUID()}.${extension}`;
    const { data, error } = await supabase.storage.from("temoignages").upload(photoPath, photo, {
      cacheControl: "3600",
      contentType: photo.type,
      upsert: false,
    });
    if (error) {
      console.error("Impossible d’enregistrer la photo d’un témoignage.", error);
      return NextResponse.json({ error: "La photo n’a pas pu être envoyée. Réessayez." }, { status: 503 });
    }
    photoUrl = supabase.storage.from("temoignages").getPublicUrl(data.path).data.publicUrl;
  }

  const { error } = await supabase.from("temoignages").insert({
    ...payloadResult.data,
    photo_url: photoUrl,
    affiche: false,
  });
  if (error) {
    console.error("Impossible d’enregistrer un nouveau témoignage.", error);
    if (photoPath) {
      const { error: cleanupError } = await supabase.storage.from("temoignages").remove([photoPath]);
      if (cleanupError) console.error("Impossible de nettoyer la photo après l’échec d’enregistrement du témoignage.", cleanupError);
    }
    return NextResponse.json({ error: "Le témoignage n’a pas pu être enregistré. Réessayez." }, { status: 503 });
  }

  return NextResponse.json({ submitted: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
}
