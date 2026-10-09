"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PasswordField } from "@/components/auth/password-field";
import { meetsPasswordPolicy, MIN_PASSWORD_LENGTH, PASSWORD_POLICY_DESCRIPTION } from "@/lib/auth-password";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailUpdatesOptIn, setEmailUpdatesOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!meetsPasswordPolicy(password)) {
      setError(`Votre mot de passe ne respecte pas les critères requis : ${PASSWORD_POLICY_DESCRIPTION}`);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, password, fullName, emailUpdatesOptIn }),
      });
      const result = await response.json() as { error?: string; confirmationRequired?: boolean };
      if (!response.ok) throw new Error(result.error ?? "La création du compte a échoué.");
      if (!result.confirmationRequired) {
        window.dispatchEvent(new Event("auth-session-changed"));
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setConfirmationSent(true);
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "La création du compte a échoué.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendConfirmation() {
    if (!email.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResendMessage(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend-confirmation", email }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Impossible de renvoyer le lien pour le moment.");
      setResendMessage("Si cette adresse attend une confirmation, un nouveau lien vient d’être envoyé.");
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "Impossible de renvoyer le lien pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-earth px-5 py-12 text-kaolin sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-xl rounded-3xl border border-gold/25 bg-panel p-6 shadow-2xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Espace partenaire</p>
        <h1 className="font-display mt-2 text-3xl text-white">Inscrire mon établissement</h1>
        <p className="mt-3 text-sm leading-6 text-kaolin/70">Rejoignez Gagnants 229 et mettez votre établissement en valeur auprès de nos visiteurs.</p>

        {confirmationSent ? (
          <div aria-live="polite" className="mt-7 rounded-2xl border border-gold/35 bg-earth/70 p-5">
            <h2 className="font-display text-xl text-white">Vérifiez votre boîte e-mail</h2>
            <p className="mt-2 text-sm leading-6 text-kaolin/75">
              Si l’adresse peut être inscrite, un lien de confirmation a été envoyé à <strong className="text-white">{email}</strong>.
              Cliquez sur ce lien pour confirmer votre adresse et accéder à votre espace partenaire.
            </p>
            {resendMessage && <p role="status" className="mt-3 text-sm text-gold">{resendMessage}</p>}
            {error && <p role="alert" className="mt-3 rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
            <button
              className="mt-5 min-h-11 w-full rounded-xl border border-gold/40 px-4 py-2 text-sm font-bold text-gold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading || !email.trim()}
              onClick={handleResendConfirmation}
              type="button"
            >
              {loading ? "Envoi en cours…" : "Renvoyer le lien de confirmation"}
            </button>
            <button className="mt-5 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-earth" onClick={() => router.push("/login")} type="button">
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold text-kaolin">
              Nom complet
              <input
                autoComplete="name"
                className="mt-2 min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 text-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                minLength={2}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Aziz EEBE"
                required
                value={fullName}
              />
            </label>
            <label className="block text-sm font-semibold text-kaolin">
              Adresse e-mail professionnelle
              <input
                autoComplete="email"
                className="mt-2 min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 text-white outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="contact@votre-entreprise.com"
                required
                type="email"
                value={email}
              />
            </label>
            <PasswordField
              autoComplete="new-password"
              id="register-password"
              label="Mot de passe"
              minLength={MIN_PASSWORD_LENGTH}
              onChange={setPassword}
              placeholder={`${MIN_PASSWORD_LENGTH} caractères minimum`}
              value={password}
            />
            <p className="-mt-2 text-xs leading-5 text-kaolin/55">{PASSWORD_POLICY_DESCRIPTION}</p>
            <label className="flex items-start gap-3 text-sm leading-6 text-kaolin/75">
              <input
                checked={emailUpdatesOptIn}
                className="mt-1 size-4 shrink-0 accent-[#d4af37]"
                onChange={(event) => setEmailUpdatesOptIn(event.target.checked)}
                type="checkbox"
              />
              <span>J’accepte de recevoir par e-mail les actualités et annonces de Gagnants 229. Je pourrai me désinscrire à tout moment.</span>
            </label>
            {error && <p aria-live="polite" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
            <button
              className="min-h-12 w-full rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Création de votre espace…" : "Créer mon espace gérant"}
            </button>
            {resendMessage && <p role="status" className="text-center text-sm text-gold">{resendMessage}</p>}
            <button
              className="w-full py-2 text-sm font-semibold text-kaolin/70 underline decoration-gold/50 underline-offset-4 transition hover:text-gold disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || !email.trim()}
              onClick={handleResendConfirmation}
              type="button"
            >
              Déjà inscrit mais pas confirmé ? Renvoyer le lien
            </button>
          </form>
        )}

        <p className="mt-6 border-t border-gold/15 pt-5 text-center text-sm text-kaolin/75">
          Vous avez déjà un compte partenaire ?{" "}
          <Link className="font-bold text-gold underline-offset-4 hover:underline" href="/login">Se connecter</Link>
        </p>
      </section>
    </main>
  );
}
