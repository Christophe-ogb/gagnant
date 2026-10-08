"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordField } from "@/components/auth/password-field";
import { getAuthErrorMessage } from "@/lib/auth-error-message";

export default function LoginPage() {
  return <Suspense fallback={<main className="min-h-[70vh] bg-earth px-5 py-12 text-kaolin" />}>
    <LoginForm />
  </Suspense>;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "La connexion a échoué.");
      window.dispatchEvent(new Event("auth-session-changed"));
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : getAuthErrorMessage(cause, "login"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-earth px-5 py-12 text-kaolin sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-gold/25 bg-panel p-6 shadow-2xl sm:p-8">
        <h1 className="font-display text-3xl text-white">Connexion</h1>
        <p className="mt-3 text-sm leading-6 text-kaolin/70">Connectez-vous pour accéder à votre espace.</p>

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
          <PasswordField
            autoComplete="current-password"
            id="login-password"
            label="Mot de passe"
            onChange={setPassword}
            placeholder="••••••••"
            value={password}
          />
          <div className="text-right">
            <Link className="text-sm font-semibold text-gold underline-offset-4 hover:underline" href="/forgot-password">
              Mot de passe oublié ?
            </Link>
          </div>
          {searchParams.get("message") === "password-updated" && <p aria-live="polite" className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-100">Ton mot de passe a été modifié. Tu peux te connecter.</p>}
          {(error || (searchParams.get("error") === "confirmation" ? "Le lien de confirmation est invalide ou a expiré. Demande un nouveau lien d’inscription." : null)) && <p aria-live="polite" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error || "Le lien de confirmation est invalide ou a expiré. Demande un nouveau lien d’inscription."}</p>}
          <button
            className="min-h-12 w-full rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 border-t border-gold/15 pt-5 text-center text-sm text-kaolin/75">
          Nouveau sur Gagnants 229 ?{" "}
          <Link className="font-bold text-gold underline-offset-4 hover:underline" href="/register">Créer un compte</Link>
        </p>
      </section>
    </main>
  );
}
