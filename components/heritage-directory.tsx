"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { HeritageItem } from "@/lib/types";

export function HeritageDirectory({ items, label }: { items: HeritageItem[]; label: string }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const value = query.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    return value ? items.filter((item) => `${item.nom} ${item.sousTitre}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(value)) : items;
  }, [items, query]);
  return <><label className="relative mt-8 block"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold" aria-hidden="true" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Rechercher dans ${label}…`} className="min-h-13 w-full rounded-2xl border border-gold/30 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-kaolin/45 focus:border-gold focus:ring-2 focus:ring-gold/25" /></label><p className="mt-5 text-sm text-kaolin/65">{visible.length} fiche{visible.length > 1 ? "s" : ""} trouvée{visible.length > 1 ? "s" : ""}.</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item) => { const ready = item.isReady !== false; return <Link key={item.id} href={`/scan/${item.id}`} className="group flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:border-gold/55 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><span><span className="text-xs font-bold uppercase tracking-[0.12em] text-gold">{item.communeAssociee}</span><span className="font-display mt-2 block text-xl text-white">{item.nom}</span><span className={`mt-1 flex items-center gap-1.5 text-xs ${ready ? "text-emerald-300" : "text-kaolin/50"}`}>{ready ? <CheckCircle2 aria-hidden="true" size={14} /> : <Clock3 aria-hidden="true" size={14} />}{ready ? "Parcours disponible" : "Parcours en préparation"}</span></span><ArrowRight className="shrink-0 text-gold transition group-hover:translate-x-1" aria-hidden="true" size={20} /></Link>; })}</div>{visible.length === 0 && <p className="mt-8 rounded-2xl border border-gold/20 bg-gold/10 p-5 text-center text-sm text-kaolin/75">Aucune fiche ne correspond à cette recherche.</p>}</>;
}
