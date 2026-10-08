import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { meetsPasswordPolicy, PASSWORD_POLICY_DESCRIPTION } from "@/lib/auth-password";
import { getAuthErrorMessage } from "@/lib/auth-error-message";
import { isSameOrigin } from "@/lib/supabase/api-auth";
import { enforceRateLimit, requestRateLimitIdentifier } from "@/lib/security/rate-limit";
import { readJsonBody } from "@/lib/security/request-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const emailSchema = z.string().trim().email("Saisissez une adresse e-mail valide.").max(320, "L’adresse e-mail est trop longue.");
const passwordSchema = z.string().min(1, "Saisissez votre mot de passe.").max(256, "Le mot de passe est trop long.");
const authPayloadSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("login"), email: emailSchema, password: passwordSchema }).strict(),
  z.object({
    action: z.literal("register"),
    email: emailSchema,
    password: passwordSchema,
    fullName: z.string().trim().min(2, "Le nom complet doit contenir au moins 2 caractères.").max(120, "Le nom complet ne peut pas dépasser 120 caractères."),
    emailUpdatesOptIn: z.boolean().optional().default(false),
  }).strict(),
  z.object({ action: z.literal("forgot-password"), email: emailSchema }).strict(),
  z.object({ action: z.literal("reset-password"), password: passwordSchema }).strict(),
  z.object({ action: z.literal("logout") }).strict(),
]);

function jsonError(error: string, status = 400) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error && error.name !== "AuthSessionMissingError" && error.status !== 401) {
    console.error("Impossible de vérifier la session d’authentification.", error);
    return jsonError("Impossible de vérifier votre session.", 503);
  }
  if (!user) return NextResponse.json({ user: null }, { headers: { "Cache-Control": "no-store" } });

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Impossible de charger le profil de la session.", profileError);
    return jsonError("Impossible de charger votre profil.", 503);
  }
  return NextResponse.json({
    user: { id: user.id, email: user.email ?? "", fullName: profile?.full_name ?? "", role: profile?.role ?? "visitor" },
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError("Requête non autorisée.", 403);

  const requestLimit = await enforceRateLimit(request, {
    key: "auth:requests",
    identifier: requestRateLimitIdentifier(request),
    limit: 40,
  });
  if (requestLimit) return requestLimit;

  const parsed = await readJsonBody(request, authPayloadSchema, {
    maxBytes: 4096,
    invalidMessage: "Les informations envoyées sont invalides.",
  });
  if (!parsed.success) return parsed.response;
  const payload = parsed.data;
  const limits = {
    login: 10,
    register: 5,
    "forgot-password": 3,
    "reset-password": 5,
    logout: 10,
  } as const;
  const limited = await enforceRateLimit(request, {
    key: `auth:${payload.action}`,
    identifier: requestRateLimitIdentifier(request),
    limit: limits[payload.action],
  });
  if (limited) return limited;

  const supabase = await createSupabaseServerClient();

  if (payload.action === "login") {
    const { data, error } = await supabase.auth.signInWithPassword({ email: payload.email, password: payload.password });
    if (error) return jsonError(getAuthErrorMessage(error, "login"), error.status === 429 ? 429 : 401);
    if (!data.user) return jsonError("La connexion n’a pas abouti. Vérifiez vos identifiants.", 401);
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  }

  if (payload.action === "register") {
    if (!meetsPasswordPolicy(payload.password)) return jsonError(`Votre mot de passe ne respecte pas les critères requis : ${PASSWORD_POLICY_DESCRIPTION}`);
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback?next=/dashboard`,
        data: {
          full_name: payload.fullName,
          email_updates_opt_in: payload.emailUpdatesOptIn,
        },
      },
    });
    if (error) return jsonError(getAuthErrorMessage(error, "register"), error.status === 429 ? 429 : 400);
    return NextResponse.json({ confirmationRequired: !data.session }, { headers: { "Cache-Control": "no-store" } });
  }

  if (payload.action === "forgot-password") {
    const { error } = await supabase.auth.resetPasswordForEmail(payload.email, {
      redirectTo: `${request.nextUrl.origin}/auth/callback?next=/reset-password`,
    });
    if (error) return jsonError(getAuthErrorMessage(error, "forgot-password"), error.status === 429 ? 429 : 400);
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  }

  if (payload.action === "reset-password") {
    if (!meetsPasswordPolicy(payload.password)) return jsonError(`Votre mot de passe ne respecte pas les critères requis : ${PASSWORD_POLICY_DESCRIPTION}`);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return jsonError("Le lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien.", 401);
    const { error } = await supabase.auth.updateUser({ password: payload.password });
    if (error) return jsonError(getAuthErrorMessage(error, "reset-password"), error.status === 429 ? 429 : 400);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Le mot de passe a été modifié, mais la session de réinitialisation n’a pas pu être fermée.", signOutError);
      return NextResponse.json({
        success: true,
        sessionClosureWarning: "Votre mot de passe a été modifié, mais la session de réinitialisation n’a pas pu être fermée automatiquement. Fermez votre navigateur avant de vous reconnecter.",
      }, { headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  }

  if (payload.action === "logout") {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Impossible de fermer la session Supabase.", error);
      return jsonError("La déconnexion a échoué. Réessayez.", 503);
    }
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  }

  return jsonError("Action d’authentification inconnue.", 404);
}
