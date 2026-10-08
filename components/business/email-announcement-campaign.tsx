"use client";

import { useEffect, useState, type FormEvent } from "react";

type CampaignResponse = { recipientCount?: number; sendingConfigured?: boolean; sent?: number; error?: string };

export function EmailAnnouncementCampaign() {
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [sendingConfigured, setSendingConfigured] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/email-announcements", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json() as CampaignResponse;
        if (!response.ok) throw new Error(result.error ?? "Impossible de charger les destinataires.");
        if (active) {
          setRecipientCount(result.recipientCount ?? 0);
          setSendingConfigured(result.sendingConfigured ?? false);
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Impossible de charger les destinataires.");
      });
    return () => { active = false; };
  }, []);

  async function sendCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (recipientCount === 0) {
      setError("Aucun membre n’a accepté de recevoir les annonces par e-mail.");
      return;
    }
    if (!window.confirm(`Envoyer cet e-mail aux ${recipientCount ?? "membres inscrits volontairement"} membre(s) ayant accepté les annonces ?`)) return;

    setSending(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/email-announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, campaignId: crypto.randomUUID() }),
      });
      const result = await response.json() as CampaignResponse;
      if (!response.ok) throw new Error(result.error ?? "L’envoi de la campagne a échoué.");
      setNotice(`La campagne a été acceptée par Brevo pour ${result.sent ?? 0} destinataire(s).`);
      setSubject("");
      setMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L’envoi de la campagne a échoué.");
    } finally {
      setSending(false);
    }
  }

  return <section aria-labelledby="email-campaign-heading" className="mt-10 rounded-2xl border border-gold/25 bg-earth/50 p-5 sm:p-6">
    <h2 className="font-display text-2xl text-white" id="email-campaign-heading">Annonces aux membres</h2>
    <p className="mt-2 text-sm leading-6 text-kaolin/70">
      Envoyez une actualité ou une annonce aux membres qui ont expressément accepté les e-mails. Les autres ne recevront rien. Chaque message contient un lien de désinscription.
    </p>
    <p className="mt-3 text-sm font-bold text-gold">
      {recipientCount === null ? "Chargement du nombre de destinataires…" : `${recipientCount} membre(s) autorisé(s) à recevoir les annonces`}
    </p>
    {!sendingConfigured && <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-950/20 p-3 text-sm text-amber-100">L’envoi sera disponible après la configuration des accès Brevo côté serveur.</p>}
    <form className="mt-5 space-y-4" onSubmit={sendCampaign}>
      <label className="block text-sm font-semibold text-kaolin">
        Objet de l’e-mail
        <input className="mt-2 min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 text-white outline-none focus:border-gold" maxLength={120} minLength={3} onChange={(event) => setSubject(event.target.value)} required value={subject} />
      </label>
      <label className="block text-sm font-semibold text-kaolin">
        Message
        <textarea className="mt-2 min-h-40 w-full rounded-xl border border-gold/30 bg-earth px-4 py-3 text-white outline-none focus:border-gold" maxLength={10000} minLength={10} onChange={(event) => setMessage(event.target.value)} required value={message} />
        <span className="mt-1 block text-xs font-normal text-kaolin/55">Texte brut. Utilisez {"{{prenom}}"} pour personnaliser le prénom du destinataire.</span>
      </label>
      {error && <p aria-live="polite" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
      {notice && <p aria-live="polite" className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-100">{notice}</p>}
      <button className="min-h-11 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth disabled:cursor-not-allowed disabled:opacity-60" disabled={sending || !sendingConfigured || recipientCount === null || recipientCount === 0} type="submit">
        {sending ? "Envoi en cours…" : "Envoyer l’annonce"}
      </button>
    </form>
  </section>;
}
