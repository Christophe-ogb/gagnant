"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = { href?: string; label?: string };

export function ReturnToExploration({ href = "/", label = "Retour à l’exploration" }: Props) {
  const router = useRouter();

  function goBack() {
    if (document.referrer.startsWith(window.location.origin)) {
      router.back();
      return;
    }

    router.push(href);
  }

  return <button type="button" onClick={goBack} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-bold text-kaolin/70 transition hover:text-gold active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><ArrowLeft aria-hidden="true" size={17} /> {label}</button>;
}
