"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";

type CounterResponse = { count: number };

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function readCounter() {
      const response = await fetch("/api/visitors", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as CounterResponse;
      if (active) setCount(data.count);
    }

    void readCounter();
    const refresh = window.setInterval(() => void readCounter(), 60_000);
    return () => {
      active = false;
      window.clearInterval(refresh);
    };
  }, []);

  if (count === null) return null;

  return (
    <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-bold text-gold">
      <Users aria-hidden="true" size={15} />
      <span>Rejoins les joueurs de Gagnants 229 : <strong>{new Intl.NumberFormat("fr-FR").format(count)}</strong> visites et explorations déjà enregistrées.</span>
    </p>
  );
}

export function VisitTracker() {
  useEffect(() => {
    function recordVisit() {
      void fetch("/api/visitors", { method: "POST", cache: "no-store", keepalive: true });
    }

    // Chaque arrivée et chaque lien cliqué compte, même pour une même personne.
    recordVisit();
    function countLinkClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!link || link.getAttribute("href")?.startsWith("#")) return;
      recordVisit();
    }

    document.addEventListener("click", countLinkClick, true);
    return () => document.removeEventListener("click", countLinkClick, true);
  }, []);

  return null;
}
