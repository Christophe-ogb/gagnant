"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = { href?: string; label?: string; className?: string };

export function ReturnToExploration({ href = "/", label = "Retour \u00e0 l\u2019exploration", className = "" }: Props) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(href);
  }

  return <button type="button" onClick={goBack} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-bold text-kaolin/70 transition hover:text-gold active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${className}`}><ArrowLeft aria-hidden="true" size={17} /> {label}</button>;
}
