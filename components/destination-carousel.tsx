"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Navigation } from "lucide-react";
import { useRef } from "react";
import type { HeritageItem } from "@/lib/types";

type Destination = HeritageItem & { tagline: string };

export function DestinationCarousel({ destinations }: { destinations: Destination[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  function move(direction: "next" | "previous") {
    carouselRef.current?.scrollBy({ left: direction === "next" ? 340 : -340, behavior: "smooth" });
  }

  return <section className="relative border-y border-gold/15 bg-[#21160f]/80 px-5 py-14 sm:px-8 lg:px-10" aria-labelledby="destination-title">
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-2xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold"><Navigation aria-hidden="true" size={15} /> Destination Bénin</p><h2 id="destination-title" className="font-display mt-3 text-3xl leading-tight text-white sm:text-4xl">Le Bénin se découvre destination après destination.</h2><p className="mt-4 text-sm leading-7 text-kaolin/70 sm:text-base">Des vallées aux palais, des cités lacustres aux lieux de mémoire : choisis une destination et commence le voyage.</p></div>
        <div className="hidden gap-2 sm:flex"><button type="button" onClick={() => move("previous")} className="grid size-11 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold transition hover:bg-gold hover:text-earth active:scale-95" aria-label="Destination précédente"><ArrowLeft aria-hidden="true" size={18} /></button><button type="button" onClick={() => move("next")} className="grid size-11 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold transition hover:bg-gold hover:text-earth active:scale-95" aria-label="Destination suivante"><ArrowRight aria-hidden="true" size={18} /></button></div>
      </div>
      <div ref={carouselRef} className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        {destinations.map((destination) => <article key={destination.id} className="group relative h-105 w-[82vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-gold/20 bg-panel sm:w-78"><img src={destination.imageUrl} alt={destination.imageAlt} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-[#1a120b] via-[#1a120b]/35 to-transparent" /><div className="relative flex h-full flex-col justify-end p-5"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.13em] text-gold"><MapPin aria-hidden="true" size={14} /> {destination.nom}</p><h3 className="font-display mt-2 text-2xl text-white">{destination.tagline}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-kaolin/75">{destination.sousTitre}</p><Link href={`/scan/${destination.id}`} className="mt-5 inline-flex w-fit min-h-10 items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-sm font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95">Explorer <ArrowRight aria-hidden="true" size={16} /></Link></div></article>)}
      </div>
      <p className="mt-2 text-xs text-kaolin/45 sm:hidden">Fais glisser les cartes pour découvrir d’autres destinations.</p>
    </div>
  </section>;
}
