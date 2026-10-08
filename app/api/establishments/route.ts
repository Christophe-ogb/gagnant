import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, isSameOrigin } from "@/lib/supabase/api-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { readFormDataBody } from "@/lib/security/request-validation";
import { establishmentEquipment, type Establishment } from "@/lib/establishments";

export const dynamic = "force-dynamic";
const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_FORM_BYTES = MAX_PHOTOS * MAX_PHOTO_BYTES + 128 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const nullablePriceSchema = z.number().int().min(0).max(100_000_000).nullable();
const optionListSchema = z.array(z.string().trim().min(1).max(100)).max(30);
const establishmentDetailsSchema = z.object({
  apartment: z.object({
    passagePrice: nullablePriceSchema,
    nightPrice: nullablePriceSchema,
    dayPrice: nullablePriceSchema,
    longStayDiscount: z.number().int().min(0).max(100).nullable(),
    maxAdults: z.number().int().min(1).max(100).nullable(),
    bedrooms: z.number().int().min(0).max(100).nullable(),
    energyOptions: optionListSchema,
    amenities: optionListSchema,
    landmark: z.string().trim().max(200),
  }).strict(),
  restaurant: z.object({
    cuisines: optionListSchema,
    signatureDishes: z.string().trim().max(1000),
    averageMainPrice: nullablePriceSchema,
    services: optionListSchema,
    ambiance: optionListSchema,
    openingHours: z.string().trim().max(500),
    closedDays: z.string().trim().max(200),
  }).strict(),
  hotel: z.object({
    standardRoomPrice: nullablePriceSchema,
    vipSuitePrice: nullablePriceSchema,
    breakfast: z.enum(["", "included", "extra", "unavailable"]),
    services: optionListSchema,
    meetingRoomCapacity: z.number().int().min(0).max(10000).nullable(),
    facilities: optionListSchema,
  }).strict(),
}).strict();

const establishmentSubmissionSchema = z.object({
  businessType: z.enum(["hotel", "restaurant", "apartment"]),
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(3).max(40),
  address: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(3000),
  equipment: z.array(z.enum(establishmentEquipment)).max(establishmentEquipment.length),
  details: establishmentDetailsSchema,
  retainedPhotos: z.array(z.string().min(1).max(300)).max(MAX_PHOTOS),
  primaryNewPhoto: z.enum(["true", "false"]).transform((value) => value === "true"),
}).strict();

export async function GET() {
  const access = await getAuthenticatedUser();
  if ("response" in access) return access.response;
  const { data, error } = await access.supabase
    .from("establishments")
    .select("*")
    .eq("owner_id", access.user.id)
    .maybeSingle();
  if (error) {
    console.error("Impossible de charger la fiche de l’utilisateur.", error);
    return NextResponse.json({ error: "Impossible de charger votre fiche." }, { status: 503 });
  }
  if (!data) return NextResponse.json({ record: null, photoUrls: [] }, { headers: { "Cache-Control": "no-store" } });

  const record = data as Establishment;
  let photoUrls: string[];
  try {
    photoUrls = await Promise.all(record.photos.map(async (path) => {
      const { data: photo, error: photoError } = await access.supabase.storage
        .from("establishment-photos")
        .createSignedUrl(path, 3600);
      if (photoError) throw photoError;
      return photo.signedUrl;
    }));
  } catch (cause) {
    console.error("Impossible de créer les URL temporaires des photos du partenaire.", cause);
    return NextResponse.json({ error: "Impossible de charger les photos de votre fiche." }, { status: 503 });
  }
  return NextResponse.json({ record, photoUrls }, { headers: { "Cache-Control": "no-store" } });
}

function parseJson(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const access = await getAuthenticatedUser();
  if ("response" in access) return access.response;

  const limited = await enforceRateLimit(request, {
    key: "partner:establishment-submission",
    identifier: access.user.id,
    limit: 5,
  });
  if (limited) return limited;

  const parsedFormData = await readFormDataBody(request, MAX_FORM_BYTES);
  if (!parsedFormData.success) return parsedFormData.response;
  const formData = parsedFormData.data;

  const parsed = establishmentSubmissionSchema.safeParse({
    businessType: formData.get("businessType"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    description: formData.get("description"),
    equipment: parseJson(formData.get("equipment")),
    details: parseJson(formData.get("details")),
    retainedPhotos: parseJson(formData.get("retainedPhotos")),
    primaryNewPhoto: formData.get("primaryNewPhoto"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifiez le type, les informations, les équipements et les détails de la fiche." }, { status: 400 });
  }
  const { businessType, name, phone, address, description, equipment, details, retainedPhotos, primaryNewPhoto } = parsed.data;
  const photoEntries = formData.getAll("photos");
  if (photoEntries.some((value) => !(value instanceof File))) {
    return NextResponse.json({ error: "Le format des photos envoyées est invalide." }, { status: 400 });
  }
  const files = photoEntries.filter((value): value is File => value instanceof File && value.size > 0);

  if (new Set(retainedPhotos).size !== retainedPhotos.length) {
    return NextResponse.json({ error: "Une même photo ne peut pas être sélectionnée plusieurs fois." }, { status: 400 });
  }
  if (files.length + retainedPhotos.length > MAX_PHOTOS) {
    return NextResponse.json({ error: `Vous pouvez enregistrer ${MAX_PHOTOS} photos au maximum.` }, { status: 400 });
  }
  const invalidFile = files.find((file) => !ACCEPTED_IMAGE_TYPES.has(file.type) || file.size > MAX_PHOTO_BYTES);
  if (invalidFile) return NextResponse.json({ error: "Chaque photo doit être au format JPG, PNG ou WebP et ne pas dépasser 5 Mo." }, { status: 400 });

  const { data: current, error: currentError } = await access.supabase
    .from("establishments")
    .select("id, status, photos")
    .eq("owner_id", access.user.id)
    .maybeSingle();
  if (currentError) {
    console.error("Impossible de vérifier la fiche avant son enregistrement.", currentError);
    return NextResponse.json({ error: "Impossible de vérifier votre fiche." }, { status: 503 });
  }
  if (current?.status === "approved") {
    return NextResponse.json({ error: "Cette fiche est déjà publiée. Contactez l’équipe pour demander une modification." }, { status: 409 });
  }
  const previousPhotos = (current?.photos ?? []) as string[];
  if (retainedPhotos.some((path) => !previousPhotos.includes(path) || !path.startsWith(`${access.user.id}/`))) {
    return NextResponse.json({ error: "La sélection de photos enregistrées est invalide." }, { status: 400 });
  }

  const uploadedPaths: string[] = [];
  try {
    const newPaths: string[] = [];
    for (const file of files) {
      const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
      const path = `${access.user.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await access.supabase.storage.from("establishment-photos").upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      uploadedPaths.push(path);
      newPaths.push(path);
    }

    const orderedPhotos = primaryNewPhoto
      ? [...newPaths, ...retainedPhotos]
      : [...retainedPhotos, ...newPaths];
    const signedPhotos = await Promise.all(orderedPhotos.map(async (path) => {
      const { data: photo, error: photoError } = await access.supabase.storage.from("establishment-photos").createSignedUrl(path, 3600);
      if (photoError) throw photoError;
      return photo.signedUrl;
    }));
    const { data, error } = await access.supabase
      .from("establishments")
      .upsert({
        owner_id: access.user.id,
        business_type: businessType,
        name,
        phone,
        address,
        description,
        equipment,
        details,
        photos: orderedPhotos,
        status: "pending",
        rejection_reason: null,
        rejected_at: null,
      }, { onConflict: "owner_id" })
      .select("*")
      .single();
    if (error) throw error;

    const removedPhotos = previousPhotos.filter((path) => !retainedPhotos.includes(path));
    if (removedPhotos.length > 0) {
      const { error: cleanupError } = await access.supabase.storage.from("establishment-photos").remove(removedPhotos);
      if (cleanupError) {
        console.error("La fiche a été enregistrée, mais certaines anciennes photos n’ont pas été nettoyées.", cleanupError);
        return NextResponse.json({ error: "La fiche est enregistrée, mais le nettoyage de photos retirées a échoué. Contactez l’équipe." }, { status: 503 });
      }
    }

    return NextResponse.json({ record: data, photoUrls: signedPhotos }, { headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await access.supabase.storage.from("establishment-photos").remove(uploadedPaths);
      if (cleanupError) console.error("Échec du nettoyage des nouvelles photos après une erreur d’enregistrement.", cleanupError);
    }
    console.error("Impossible d’enregistrer la fiche d’établissement.", cause);
    return NextResponse.json({ error: "Impossible d’enregistrer la fiche. Vérifiez vos informations et vos photos, puis réessayez." }, { status: 503 });
  }
}
