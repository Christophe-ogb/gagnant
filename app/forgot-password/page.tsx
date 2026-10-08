"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot-password", email }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "L’envoi du lien a échoué.");
      setMessage("Si un compte correspond à cette adresse, un lien de réinitialisation vient de lui être envoyé.");
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "L’envoi du lien a échoué.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-earth px-5 py-12 text-kaolin sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-gold/25 bg-panel p-6 shadow-2xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Récupération</p>
        <h1 className="font-display mt-2 text-3xl text-white">Mot de passe oublié ?</h1>
        <p className="mt-3 text-sm leading-6 text-kaolin/70">Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.</p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block text-sm font-semibold text-kaolin">
            Adresse e-mail
            <input
              autoComplete="email"
              className="mt-2 min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 text-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nom@exemple.com"
              required
              type="email"
              value={email}
            />
          </label>
          {message && <p aria-live="polite" className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-100">{message}</p>}
          {error && <p aria-live="polite" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
          <button className="min-h-12 w-full rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth disabled:opacity-60" disabled={loading} type="submit">
            {loading ? "Envoi…" : "Réinitialiser mon mot de passe"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-kaolin/75">
          <Link className="inline-flex items-center gap-2 font-bold text-gold underline-offset-4 hover:underline" href="/login">
            <ArrowLeft aria-hidden="true" size={16} /> Retour à la page de connexion
          </Link>
        </p>
      </section>
    </main>
  );
}
