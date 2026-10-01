"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { departments } from "@/lib/departements";

export function DepartmentsPreview() {
  const trackRef = useRef<HTMLDivElement>(null);
  const move = (direction: "previous" | "next") => trackRef.current?.scrollBy({ left: direction === "next" ? 360 : -360, behavior: "smooth" });

  return <section className="border-y border-gold/20 bg-[#21160f]/80 px-5 py-12 sm:px-8 lg:px-10">
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Explorer le B&#233;nin</p><h2 className="font-display mt-3 text-3xl text-white sm:text-4xl">Les 12 d&#233;partements</h2></div><Link href="/departements" className="shrink-0 text-sm font-bold text-gold transition hover:text-white">Tout voir</Link></div>
      <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => move("previous")} className="grid size-10 place-items-center rounded-full border border-gold/35 bg-panel text-gold transition hover:bg-gold hover:text-earth" aria-label="D&#233;partements pr&#233;c&#233;dents"><ArrowLeft size={18} /></button><button type="button" onClick={() => move("next")} className="grid size-10 place-items-center rounded-full border border-gold/35 bg-panel text-gold transition hover:bg-gold hover:text-earth" aria-label="D&#233;partements suivants"><ArrowRight size={18} /></button></div>
      <div ref={trackRef} className="-mx-3 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-4 [scrollbar-width:none]">
        {departments.map((department, index) => <Link key={department.slug} href={`/departements/${department.slug}`} className="group w-44 shrink-0 snap-start rounded-2xl border border-gold/25 bg-panel p-5 transition hover:-translate-y-1 hover:border-gold/60"><p className="text-xs font-bold text-gold/70">{String(index + 1).padStart(2, "0")}</p><h3 className="font-display mt-2 text-2xl text-white">{department.nom}</h3><p className="mt-1 text-sm text-kaolin/65">{department.communes.length} communes</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-gold">D&#233;couvrir <ArrowRight aria-hidden="true" size={16} /></span></Link>)}
      </div>
      <p className="mt-1 text-xs text-kaolin/55">Utilise les fl&#232;ches ou fais glisser les cartes horizontalement.</p>
    </div>
  </section>;
}
