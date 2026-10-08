import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { readJsonBody } from "@/lib/security/request-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_CAMPAIGN_RECIPIENTS = 2000;
const BREVO_BATCH_SIZE = 99;
const campaignPayloadSchema = z.object({
  subject: z.string().trim().min(3, "L’objet doit contenir au moins 3 caractères.").max(120, "L’objet ne peut pas dépasser 120 caractères.").refine((subject) => !/[\r\n]/.test(subject), "L’objet doit tenir sur une seule ligne."),
  message: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères.").max(10000, "Le message ne peut pas dépasser 10 000 caractères."),
  campaignId: z.string().uuid("Identifiant de campagne invalide.").regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, "Identifiant de campagne invalide."),
}).strict();

type Subscriber = {
  email: string;
  full_name: string;
  unsubscribe_token: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function getBrevoErrorMessage(responseBody: string, status: number) {
  let providerCode = "";
  let providerMessage = "";
  try {
    const payload: unknown = JSON.parse(responseBody);
    if (typeof payload === "object" && payload !== null) {
      const record = payload as Record<string, unknown>;
      if (typeof record.code === "string") providerCode = record.code.toLowerCase();
      if (typeof record.message === "string") providerMessage = record.message;
    }
  } catch {
    providerMessage = "";
  }

  const normalized = `${providerCode} ${providerMessage}`.toLowerCase();
  if (status === 401 || status === 403 || /unauthorized|invalid[_ ]api[_ ]?key|authentication/.test(normalized)) {
    return "Authentification Brevo refusée (401/403). Vérifiez que le serveur a redémarré après le remplacement de BREVO_API_KEY et que la valeur est une clé API v3 active (xkeysib-), sans espaces ni clé SMTP. Aucun message n’a été accepté.";
  }
  if (/sender|from address|email address.*valid|not verified|not authorized/.test(normalized)) {
    return "Brevo refuse l’adresse d’expédition. Vérifiez dans Brevo que l’adresse configurée dans BREVO_SENDER_EMAIL est ajoutée et confirmée comme expéditeur autorisé.";
  }
  if (/quota|daily limit|rate limit|too many/.test(normalized) || status === 429) {
    return "La limite d’envoi Brevo est atteinte. Consultez les limites de votre compte avant de réessayer.";
  }
  if (providerMessage) {
    const safeMessage = providerMessage
      .replace(/[\r\n\t]+/g, " ")
      .replace(/xkeysib-[a-z0-9-]+/gi, "[clé masquée]")
      .replace(/(api[-_ ]?key|authorization)\s*[:=]\s*\S+/gi, "$1 [masqué]")
      .slice(0, 300);
    return `Brevo a refusé le lot (HTTP ${status}) : ${safeMessage}`;
  }
  return `Brevo a refusé le lot (HTTP ${status}) sans préciser la cause. Vérifiez l’expéditeur autorisé et l’état du compte dans Brevo.`;
}

async function getAdminClient() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { response: NextResponse.json({ error: "Connectez-vous pour continuer." }, { status: 401 }) };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Impossible de vérifier les droits de campagne e-mail.", profileError);
    return { response: NextResponse.json({ error: "Impossible de vérifier vos droits." }, { status: 500 }) };
  }
  if (profile?.role !== "admin") {
    return { response: NextResponse.json({ error: "Accès réservé à l’administration." }, { status: 403 }) };
  }
  return { supabase, user };
}

export async function GET() {
  const access = await getAdminClient();
  if ("response" in access) return access.response;

  const { count, error } = await access.supabase
    .from("email_announcement_subscribers")
    .select("user_id", { count: "exact", head: true })
    .is("unsubscribed_at", null);
  if (error) {
    console.error("Impossible de compter les abonnés aux annonces.", error);
    return NextResponse.json({ error: "Impossible de charger le nombre de destinataires." }, { status: 503 });
  }
  return NextResponse.json({
    recipientCount: count ?? 0,
    sendingConfigured: Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL && process.env.APP_BASE_URL),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  let originMatchesRequest = false;
  try {
    originMatchesRequest = Boolean(origin && new URL(origin).origin === request.nextUrl.origin);
  } catch {
    originMatchesRequest = false;
  }
  if (!originMatchesRequest) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }

  const access = await getAdminClient();
  if ("response" in access) return access.response;

  const limited = await enforceRateLimit(request, {
    key: "admin:email-announcements",
    identifier: access.user.id,
    limit: 2,
  });
  if (limited) return limited;

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Gagnants 229";
  const siteUrl = process.env.APP_BASE_URL;
  if (!apiKey || !senderEmail || !siteUrl) {
    return NextResponse.json({ error: "L’envoi n’est pas configuré. Renseignez les paramètres Brevo côté serveur." }, { status: 503 });
  }

  const parsed = await readJsonBody(request, campaignPayloadSchema, {
    maxBytes: 16_384,
    invalidMessage: "Le contenu de la campagne est invalide.",
  });
  if (!parsed.success) return parsed.response;
  const { subject, message, campaignId } = parsed.data;

  const { count, error: countError } = await access.supabase
    .from("email_announcement_subscribers")
    .select("user_id", { count: "exact", head: true })
    .is("unsubscribed_at", null)
  if (countError) {
    console.error("Impossible de compter les destinataires ayant accepté les annonces.", countError);
    return NextResponse.json({ error: "Impossible de charger les destinataires autorisés." }, { status: 503 });
  }
  if (!count) {
    return NextResponse.json({ error: "Aucun membre n’a accepté de recevoir les annonces par e-mail." }, { status: 400 });
  }
  if (count > MAX_CAMPAIGN_RECIPIENTS) {
    return NextResponse.json({ error: `Cette campagne dépasse la limite de ${MAX_CAMPAIGN_RECIPIENTS} destinataires. Contactez l’administrateur technique pour organiser un envoi par lots.` }, { status: 400 });
  }
  const subscribers: Subscriber[] = [];
  for (let offset = 0; offset < count; offset += 1000) {
    const { data, error: subscribersError } = await access.supabase
      .from("email_announcement_subscribers")
      .select("email, full_name, unsubscribe_token")
      .is("unsubscribed_at", null)
      .order("created_at", { ascending: true })
      .order("user_id", { ascending: true })
      .range(offset, Math.min(offset + 999, count - 1));
    if (subscribersError) {
      console.error("Impossible de charger les destinataires ayant accepté les annonces.", subscribersError);
      return NextResponse.json({ error: "Impossible de charger les destinataires autorisés." }, { status: 503 });
    }
    subscribers.push(...(data ?? []) as Subscriber[]);
  }
  if (subscribers.length !== count) {
    return NextResponse.json({ error: "La liste des destinataires a changé pendant sa préparation. Actualisez la page et réessayez." }, { status: 409 });
  }

  let parsedSiteUrl: URL;
  try {
    parsedSiteUrl = new URL(siteUrl);
  } catch {
    return NextResponse.json({ error: "L’adresse du site configurée pour les liens e-mail est invalide." }, { status: 503 });
  }
  if (parsedSiteUrl.protocol !== "https:" && parsedSiteUrl.hostname !== "localhost") {
    return NextResponse.json({ error: "L’adresse du site doit utiliser HTTPS." }, { status: 503 });
  }
  const baseUrl = siteUrl.replace(/\/+$/, "");
  const paragraphs = message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const htmlBody = paragraphs.map((line) => `<p>${escapeHtml(line).replace(/\{\{prenom\}\}/gi, "{{prenom}}")}</p>`).join("");
  const textBody = paragraphs.join("\n\n");
  const versions = subscribers.map((subscriber) => {
    const firstName = subscriber.full_name.trim().split(/\s+/)[0] || "membre";
    const encodedFirstName = escapeHtml(firstName);
    const unsubscribeUrl = `${baseUrl}/desinscription?token=${encodeURIComponent(subscriber.unsubscribe_token)}`;
    const personalizedHtml = htmlBody.replace(/\{\{prenom\}\}/gi, encodedFirstName);
    const personalizedText = textBody.replace(/\{\{prenom\}\}/gi, firstName);
    return {
      to: [{ email: subscriber.email, name: subscriber.full_name || firstName }],
      htmlContent: `<!doctype html><html lang="fr"><body style="font-family:Arial,sans-serif;color:#2b211b;line-height:1.6"><p>Bonjour ${encodedFirstName},</p>${personalizedHtml}<hr><p style="font-size:12px;color:#665d55">Vous recevez ce message car vous avez accepté les annonces de Gagnants 229. <a href="${escapeHtml(unsubscribeUrl)}">Se désinscrire</a></p></body></html>`,
      textContent: `Bonjour ${firstName},\n\n${personalizedText}\n\nVous recevez ce message car vous avez accepté les annonces de Gagnants 229.\nSe désinscrire : ${unsubscribeUrl}`,
    };
  });

  let sent = 0;
  for (let offset = 0; offset < versions.length; offset += BREVO_BATCH_SIZE) {
    const batch = versions.slice(offset, offset + BREVO_BATCH_SIZE);
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          "Idempotency-Key": `${campaignId}-${offset}`,
        },
        body: JSON.stringify({
          sender: { email: senderEmail, name: senderName },
          subject,
          htmlContent: "<!doctype html><html lang=\"fr\"><body><p>Annonce Gagnants 229</p></body></html>",
          textContent: "Annonce Gagnants 229",
          messageVersions: batch,
          tags: ["gagnants229-annonce"],
        }),
        cache: "no-store",
      });
      if (!response.ok) {
        const providerError = await response.text();
        const providerMessage = getBrevoErrorMessage(providerError, response.status);
        console.error(`Brevo a refusé le lot à partir du destinataire ${offset + 1}. HTTP ${response.status}.`);
        return NextResponse.json({
          error: `${providerMessage} ${sent} message(s) ont été acceptés avant l’erreur. Consultez l’historique Brevo avant de relancer pour éviter les doublons.`,
          sent,
        }, { status: 502 });
      }
      sent += batch.length;
    } catch (cause) {
      console.error(`Échec réseau Brevo pour le lot à partir du destinataire ${offset + 1}.`, cause);
      return NextResponse.json({
        error: `La connexion à Brevo a échoué. ${sent} message(s) ont été acceptés avant l’erreur ; vérifiez l’historique Brevo avant de relancer.`,
        sent,
      }, { status: 502 });
    }
  }

  return NextResponse.json({ sent }, { headers: { "Cache-Control": "no-store" } });
}
