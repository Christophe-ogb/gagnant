import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { readJsonBody } from "@/lib/security/request-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const rejectionNoticeSchema = z.object({
  establishmentId: z.string().uuid("Identifiant d’établissement invalide."),
}).strict();

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Connectez-vous pour continuer." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Impossible de vérifier les droits d’envoi du motif de refus.", profileError);
    return NextResponse.json({ error: "Impossible de vérifier vos droits." }, { status: 500 });
  }
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Accès réservé à l’administration." }, { status: 403 });
  }

  const limited = await enforceRateLimit(request, {
    key: "admin:rejection-email",
    identifier: user.id,
    limit: 5,
  });
  if (limited) return limited;

  const parsed = await readJsonBody(request, rejectionNoticeSchema, {
    maxBytes: 2048,
    invalidMessage: "La demande est invalide.",
  });
  if (!parsed.success) return parsed.response;
  const { establishmentId } = parsed.data;

  const { data: establishment, error: establishmentError } = await supabase
    .from("establishments")
    .select("owner_id, name, rejection_reason, status")
    .eq("id", establishmentId)
    .maybeSingle();
  if (establishmentError) {
    console.error("Impossible de charger la fiche refusée.", establishmentError);
    return NextResponse.json({ error: "Impossible de charger la fiche refusée." }, { status: 503 });
  }
  if (!establishment || establishment.status !== "rejected" || !establishment.rejection_reason) {
    return NextResponse.json({ error: "La fiche n’est pas refusée ou son motif est manquant." }, { status: 409 });
  }

  const { data: owner, error: ownerError } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", establishment.owner_id)
    .maybeSingle();
  if (ownerError) {
    console.error("Impossible de charger l’adresse e-mail du partenaire.", ownerError);
    return NextResponse.json({ error: "Impossible de charger le contact du partenaire." }, { status: 503 });
  }
  if (!owner?.email) {
    return NextResponse.json({ error: "Aucune adresse e-mail n’est disponible pour ce partenaire." }, { status: 409 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const appBaseUrl = process.env.APP_BASE_URL;
  if (!apiKey || !senderEmail || !appBaseUrl) {
    return NextResponse.json({ error: "L’envoi est indisponible : configurez BREVO_API_KEY, BREVO_SENDER_EMAIL et APP_BASE_URL côté serveur." }, { status: 503 });
  }
  let dashboardUrl: string;
  try {
    const parsedBaseUrl = new URL(appBaseUrl);
    if (parsedBaseUrl.protocol !== "https:" && parsedBaseUrl.hostname !== "localhost") throw new Error("HTTPS required");
    dashboardUrl = `${appBaseUrl.replace(/\/+$/, "")}/dashboard`;
  } catch {
    return NextResponse.json({ error: "L’adresse du site configurée pour l’e-mail est invalide." }, { status: 503 });
  }

  const partnerName = owner.full_name?.trim() || "Partenaire";
  let response: Response;
  try {
    response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || "Gagnants 229" },
        to: [{ email: owner.email, name: partnerName }],
        subject: `Mise à jour nécessaire pour « ${establishment.name} »`,
        textContent: [
          `Bonjour ${partnerName},`,
          "",
          `Après examen, la fiche de votre établissement « ${establishment.name} » ne peut pas encore être publiée.`,
          "",
          `Motif : ${establishment.rejection_reason}`,
          "",
          `Corrigez les informations dans votre espace partenaire puis soumettez à nouveau votre fiche : ${dashboardUrl}`,
        ].join("\n"),
        htmlContent: `<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#2b211b;line-height:1.6"><p>Bonjour ${escapeHtml(partnerName)},</p><p>Après examen, la fiche de votre établissement <strong>« ${escapeHtml(establishment.name)} »</strong> ne peut pas encore être publiée.</p><p><strong>Motif :</strong> ${escapeHtml(establishment.rejection_reason)}</p><p>Corrigez les informations dans votre espace partenaire puis soumettez à nouveau votre fiche :</p><p><a href="${escapeHtml(dashboardUrl)}">Accéder à mon espace partenaire</a></p></body></html>`,
      }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (cause) {
    console.error("Impossible de joindre Brevo pour envoyer le motif de refus.", cause);
    return NextResponse.json({ error: "La fiche a bien été refusée, mais le service d’envoi est actuellement indisponible." }, { status: 502 });
  }

  if (!response.ok) {
    console.error("Brevo a refusé l’envoi du motif de modération.", response.status);
    return NextResponse.json({ error: "La fiche a bien été refusée, mais l’e-mail n’a pas été accepté par le service d’envoi." }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}
