import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && error.name !== "AuthSessionMissingError" && error.status !== 401) {
    console.error("Impossible de vérifier la session avant l’accès à une ressource privée.", error);
    return { response: NextResponse.json({ error: "Impossible de vérifier votre session. Réessayez." }, { status: 503, headers: { "Cache-Control": "no-store" } }) };
  }
  if (!user) {
    return { response: NextResponse.json({ error: "Connectez-vous pour continuer." }, { status: 401, headers: { "Cache-Control": "no-store" } }) };
  }
  return { supabase, user };
}

export async function getAdminUser() {
  const access = await getAuthenticatedUser();
  if ("response" in access) return access;

  const { data: profile, error } = await access.supabase
    .from("profiles")
    .select("role")
    .eq("id", access.user.id)
    .maybeSingle();
  if (error) {
    console.error("Impossible de vérifier les droits d’administration.", error);
    return { response: NextResponse.json({ error: "Impossible de vérifier vos droits." }, { status: 500 }) };
  }
  if (profile?.role !== "admin") {
    return { response: NextResponse.json({ error: "Accès réservé à l’administration." }, { status: 403 }) };
  }
  return access;
}
