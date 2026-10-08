import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser, isSameOrigin } from "@/lib/supabase/api-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { readJsonBody } from "@/lib/security/request-validation";

export const dynamic = "force-dynamic";
const preferenceSchema = z.object({ subscribed: z.boolean() }).strict();

export async function GET() {
  const access = await getAuthenticatedUser();
  if ("response" in access) return access.response;
  const { data, error } = await access.supabase
    .from("email_announcement_subscribers")
    .select("unsubscribed_at")
    .eq("user_id", access.user.id)
    .maybeSingle();
  if (error) {
    console.error("Impossible de charger la préférence d’annonces e-mail.", error);
    return NextResponse.json({ error: "Impossible de charger votre préférence." }, { status: 503 });
  }
  return NextResponse.json({ subscribed: Boolean(data && !data.unsubscribed_at) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const access = await getAuthenticatedUser();
  if ("response" in access) return access.response;

  const limited = await enforceRateLimit(request, {
    key: "account:email-preferences",
    identifier: access.user.id,
    limit: 10,
  });
  if (limited) return limited;

  const parsed = await readJsonBody(request, preferenceSchema, {
    maxBytes: 1024,
    invalidMessage: "La demande de préférence est invalide.",
  });
  if (!parsed.success) return parsed.response;
  const { subscribed } = parsed.data;

  if (subscribed) {
    const { data: profile, error: profileError } = await access.supabase
      .from("profiles")
      .select("full_name")
      .eq("id", access.user.id)
      .maybeSingle();
    if (profileError) {
      console.error("Impossible de charger le nom du membre pour son consentement.", profileError);
      return NextResponse.json({ error: "Impossible d’enregistrer votre préférence." }, { status: 503 });
    }
    const { error } = await access.supabase
      .from("email_announcement_subscribers")
      .upsert({
        user_id: access.user.id,
        email: access.user.email ?? "",
        full_name: profile?.full_name ?? "",
        consented_at: new Date().toISOString(),
        unsubscribed_at: null,
      }, { onConflict: "user_id" });
    if (error) {
      console.error("Impossible d’enregistrer le consentement aux annonces.", error);
      return NextResponse.json({ error: "Impossible d’enregistrer votre préférence." }, { status: 503 });
    }
  } else {
    const { error } = await access.supabase
      .from("email_announcement_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("user_id", access.user.id);
    if (error) {
      console.error("Impossible d’enregistrer le retrait du consentement aux annonces.", error);
      return NextResponse.json({ error: "Impossible d’enregistrer votre préférence." }, { status: 503 });
    }
  }
  return NextResponse.json({ subscribed }, { headers: { "Cache-Control": "no-store" } });
}
