"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Impossible de fermer la session.");
      window.dispatchEvent(new Event("auth-session-changed"));
      router.push("/login");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de fermer la session.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="text-right">
    <button className="rounded-lg border border-gold/30 px-4 py-2 text-sm font-bold text-kaolin hover:border-gold hover:text-gold disabled:opacity-50" disabled={loading} onClick={signOut} type="button">
      {loading ? "Déconnexion…" : "Se déconnecter"}
    </button>
    {error && <p className="mt-2 text-xs text-red-200">{error}</p>}
  </div>;
}
