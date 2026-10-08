"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordField } from "@/components/auth/password-field";
import { meetsPasswordPolicy, MIN_PASSWORD_LENGTH, PASSWORD_POLICY_DESCRIPTION } from "@/lib/auth-password";

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="min-h-[70vh] bg-earth px-5 py-12 text-kaolin" />}>
    <ResetPasswordForm />
  </Suspense>;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionClosureWarning, setSessionClosureWarning] = useState<string | null>(null);
  const [updated, setUpdated] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
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
        body: JSON.stringify({ action: "reset-password", password }),
      });
      const result = await response.json() as { error?: string; sessionClosureWarning?: string };
      if (!response.ok) throw new Error(result.error ?? "La modification du mot de passe a échoué.");
      setSessionClosureWarning(result.sessionClosureWarning ?? null);
      setUpdated(true);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : "La modification du mot de passe a échoué.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[70vh] bg-earth px-5 py-12 text-kaolin sm:px-8 lg:px-10">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-gold/25 bg-panel p-6 shadow-2xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Sécurité du compte</p>
        <h1 className="font-display mt-2 text-3xl text-white">Choisir un nouveau mot de passe</h1>
        <p className="mt-3 text-sm leading-6 text-kaolin/70">Le lien reçu par e-mail est nécessaire pour enregistrer un nouveau mot de passe.</p>
        {searchParams.get("error") === "confirmation" ? <p aria-live="polite" className="mt-7 rounded-xl border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-100">Le lien est invalide ou a expiré. Demandez un nouveau lien de réinitialisation.</p> : updated ? <div aria-live="polite" className="mt-7 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-sm text-emerald-100">
          {sessionClosureWarning ?? <>Mot de passe modifié avec succès. <Link className="font-bold underline" href="/login">Connectez-vous</Link>.</>}
        </div> : <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <PasswordField autoComplete="new-password" id="new-password" label="Nouveau mot de passe" minLength={MIN_PASSWORD_LENGTH} onChange={setPassword} value={password} />
          <p className="-mt-2 text-xs leading-5 text-kaolin/55">{PASSWORD_POLICY_DESCRIPTION}</p>
          <PasswordField autoComplete="new-password" id="confirm-password" label="Confirmer le mot de passe" minLength={MIN_PASSWORD_LENGTH} onChange={setConfirmation} value={confirmation} />
          {error && <p aria-live="polite" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
          <button className="min-h-12 w-full rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth disabled:opacity-60" disabled={loading} type="submit">
            {loading ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}
          </button>
        </form>}
        <p className="mt-6 text-center text-sm text-kaolin/75">
          <Link className="font-bold text-gold underline-offset-4 hover:underline" href="/login">Retour à la connexion</Link>
        </p>
      </section>
    </main>
  );
}
