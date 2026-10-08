"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState } from "react";

export function AccountNavLink({ mobile = false }: { mobile?: boolean }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth", { cache: "no-store" });
        const result = await response.json() as { user?: unknown };
        if (active && response.ok) setSignedIn(Boolean(result.user));
      } catch (cause) {
        if (active) console.error("Impossible de vérifier la session dans la navigation.", cause);
      }
    };
    const refreshSession = () => { void checkSession(); };
    void checkSession();
    window.addEventListener("auth-session-changed", refreshSession);
    return () => {
      active = false;
      window.removeEventListener("auth-session-changed", refreshSession);
    };
  }, []);

  return <Link
    className={mobile
      ? "flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.65rem] font-bold text-kaolin/70 transition hover:bg-gold/10 hover:text-gold active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      : "whitespace-nowrap transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"}
    href={signedIn ? "/dashboard" : "/login"}
    scroll
    onClick={() => {
      if (signedIn) window.scrollTo({ top: 0, behavior: "smooth" });
    }}
  >
    {mobile && <UserRound aria-hidden="true" size={18} />}
    <span className={mobile ? "truncate" : undefined}>{signedIn ? "Mon compte" : mobile ? "Connexion" : "Se connecter"}</span>
  </Link>;
}
