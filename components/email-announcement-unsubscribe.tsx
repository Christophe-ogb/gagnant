"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function EmailAnnouncementUnsubscribe({ token }: { token: string | null }) {
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unsubscribe() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: requestError } = await supabase.rpc("unsubscribe_email_announcements", { subscriber_token: token });
      if (requestError) throw requestError;
      if (!data) throw new Error("Ce lien est invalide ou la désinscription a déjà été effectuée.");
      setDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de traiter votre demande.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="min-h-[70vh] bg-earth px-5 py-12 text-kaolin sm:px-8">
    <section className="mx-auto max-w-xl rounded-3xl border border-gold/25 bg-panel p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Gagnants 229</p>
      <h1 className="font-display mt-2 text-3xl text-white">Gestion des annonces par e-mail</h1>
      {done ? <p className="mt-4 text-sm leading-6 text-kaolin/80">Votre adresse a été désinscrite des annonces. Vous ne recevrez plus ces messages.</p> : <>
        <p className="mt-4 text-sm leading-6 text-kaolin/80">Confirmez votre désinscription des actualités et annonces de Gagnants 229.</p>
        <button className="mt-6 min-h-11 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth disabled:opacity-60" disabled={!token || loading} onClick={() => void unsubscribe()} type="button">
          {loading ? "Désinscription…" : "Confirmer ma désinscription"}
        </button>
      </>}
      {error && <p aria-live="polite" className="mt-4 rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
      {!token && <p className="mt-4 text-sm text-red-200">Le lien de désinscription est incomplet. Utilisez le lien reçu dans le message.</p>}
      <p className="mt-6 text-sm"><Link className="font-bold text-gold underline-offset-4 hover:underline" href="/">Retour au site</Link></p>
    </section>
  </main>;
}
