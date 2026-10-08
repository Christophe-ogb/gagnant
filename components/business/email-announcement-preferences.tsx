"use client";

import { useEffect, useState } from "react";

export function EmailAnnouncementPreferences() {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadPreference() {
      try {
        const response = await fetch("/api/account/email-preferences", { cache: "no-store" });
        const result = await response.json() as { subscribed?: boolean; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Impossible de charger votre préférence.");
        if (active) setSubscribed(result.subscribed ?? false);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Impossible de charger votre préférence.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadPreference();
    return () => { active = false; };
  }, []);

  async function updatePreference(nextValue: boolean) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/account/email-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscribed: nextValue }),
      });
      const result = await response.json() as { subscribed?: boolean; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Impossible d’enregistrer votre préférence.");
      setSubscribed(result.subscribed ?? nextValue);
      setNotice(nextValue
        ? "Votre inscription aux annonces par e-mail est enregistrée."
        : "Vous ne recevrez plus les annonces par e-mail.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d’enregistrer votre préférence.");
    } finally {
      setSaving(false);
    }
  }

  return <section className="mt-8 rounded-2xl border border-gold/20 bg-earth/40 p-5">
    <h2 className="font-display text-xl text-white">Annonces par e-mail</h2>
    <p className="mt-2 text-sm leading-6 text-kaolin/70">Recevez les actualités et annonces de Gagnants 229. Vous pourrez vous désinscrire à tout moment.</p>
    <label className="mt-4 flex items-start gap-3 text-sm text-kaolin/85">
      <input
        checked={subscribed}
        className="mt-1 size-4 accent-[#d4af37]"
        disabled={loading || saving}
        onChange={(event) => void updatePreference(event.target.checked)}
        type="checkbox"
      />
      <span>{subscribed ? "J’accepte de recevoir les annonces par e-mail." : "Je souhaite recevoir les annonces par e-mail."}</span>
    </label>
    {loading && <p className="mt-3 text-xs text-kaolin/55">Chargement de votre préférence…</p>}
    {error && <p aria-live="polite" className="mt-3 rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
    {notice && <p aria-live="polite" className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-100">{notice}</p>}
  </section>;
}
