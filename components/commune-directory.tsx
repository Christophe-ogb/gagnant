"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { HeritageItem } from "@/lib/types";

export function CommuneDirectory({ communes }: { communes: HeritageItem[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const value = query.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return value
      ? communes.filter((item) => item.nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(value))
      : communes;
  }, [communes, query]);

  return <>
    <label className="relative mt-8 block">
      <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold" aria-hidden="true" size={18} />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une commune : Kandi, Ouidah, Z&#232;..." className="min-h-13 w-full rounded-2xl border border-gold/30 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-kaolin/45 focus:border-gold focus:ring-2 focus:ring-gold/25" />
    </label>
    <p className="mt-5 text-sm text-kaolin/65">{visible.length} commune{visible.length > 1 ? "s" : ""} trouv&#233;e{visible.length > 1 ? "s" : ""}.</p>
    <div translate="no" className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((commune) => {
        const ready = commune.isReady !== false;
        return <Link key={commune.id} href={`/scan/${commune.id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-0.5 hover:border-gold/55 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <div className="relative h-36 overflow-hidden border-b border-white/10 bg-panel sm:h-40">
            <img src={commune.imageUrl} alt={`Aper&#231;u de ${commune.nom}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = "none"; }} />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-earth/55 via-transparent to-transparent" />
            <span translate="no" suppressHydrationWarning className="absolute bottom-3 left-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-gold"><MapPin aria-hidden="true" size={14} /> Commune</span>
          </div>
          <div className="flex min-h-28 items-center justify-between gap-4 p-4">
            <span>
              <span className="font-display block text-xl text-white">{commune.nom}</span>
              <span className={`mt-2 flex items-center gap-1.5 text-xs ${ready ? "text-emerald-300" : "text-kaolin/50"}`}>{ready ? <CheckCircle2 aria-hidden="true" size={14} /> : <Clock3 aria-hidden="true" size={14} />}{ready ? "Parcours disponible" : "Parcours en pr&#233;paration"}</span>
            </span>
            <ArrowRight className="shrink-0 text-gold transition group-hover:translate-x-1" aria-hidden="true" size={20} />
          </div>
        </Link>;
      })}
    </div>
    {visible.length === 0 && <p className="mt-8 rounded-2xl border border-gold/20 bg-gold/10 p-5 text-center text-sm text-kaolin/75">Aucune commune ne correspond &#224; cette recherche.</p>}
  </>;
}
