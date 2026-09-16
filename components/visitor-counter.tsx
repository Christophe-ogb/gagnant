"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";

type CounterResponse = { count: number };

export function VisitorCounter({ animated = true }: { animated?: boolean }) {
  const [count, setCount] = useState<number | null>(null);
  const [displayedCount, setDisplayedCount] = useState(0);

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

  useEffect(() => {
    if (count === null) return;
    if (!animated) {
      setDisplayedCount(count);
      return;
    }
    const duration = 1_500;
    const intervalDuration = 30;
    const steps = duration / intervalDuration;
    let currentStep = 0;
    setDisplayedCount(0);
    const animation = window.setInterval(() => {
      currentStep += 1;
      setDisplayedCount(Math.round((count * currentStep) / steps));
      if (currentStep >= steps) {
        window.clearInterval(animation);
        setDisplayedCount(count);
      }
    }, intervalDuration);
    return () => window.clearInterval(animation);
  }, [animated, count]);

  if (count === null) return null;
  const formattedCount = new Intl.NumberFormat("fr-FR").format(displayedCount);

  return (
    <div className="mt-6 inline-flex max-w-full flex-col items-center gap-3 rounded-2xl border border-gold/45 bg-gold/10 px-4 py-3 text-center shadow-[0_12px_32px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:flex-row sm:text-left" aria-live="polite">
      <span className="relative flex size-3 shrink-0" aria-label="Compteur en direct">
        {animated && <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-70" />}
        <span className="relative inline-flex size-3 rounded-full bg-gold ring-4 ring-gold/15" />
      </span>
      <span className="flex items-center gap-2 text-xs font-bold leading-5 text-kaolin/85 sm:text-sm"><Users aria-hidden="true" size={17} className="shrink-0 text-gold" />Rejoins la communauté des joueurs</span>
      <span className="rounded-lg border border-gold/45 bg-earth/80 px-3 py-1.5 font-mono text-lg font-black tracking-wide text-gold tabular-nums shadow-inner">{formattedCount}</span>
      <span className="text-xs font-medium text-kaolin/65">visites et explorations</span>
    </div>
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
