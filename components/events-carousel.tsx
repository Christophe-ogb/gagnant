"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Image as ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import type { HeritageItem } from "@/lib/types";

function FestivalCard({ event }: { event: HeritageItem }) {
  const gallery = (event.galerie?.length ? event.galerie : [{ imageUrl: event.imageUrl, imageAlt: event.imageAlt }]).slice(0, 5);
  const [imageIndex, setImageIndex] = useState(0);
  const image = gallery[imageIndex];
  const changeImage = (direction: "next" | "previous") => {
    setImageIndex((current) => direction === "next" ? (current + 1) % gallery.length : (current - 1 + gallery.length) % gallery.length);
  };

  return <article className="group relative h-105 w-[82vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-gold/20 bg-panel sm:w-78">
    {event.imagePending ? <div className="absolute inset-0 grid place-items-center bg-[#251910] px-5 text-center text-xs font-bold uppercase tracking-[0.14em] text-gold">Image bientôt disponible</div> : <img key={image.imageUrl} src={image.imageUrl} alt={image.imageAlt} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
    <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b] via-[#1a120b]/45 to-transparent" />
    {gallery.length > 1 && <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between"><button type="button" onClick={() => changeImage("previous")} className="grid size-10 place-items-center rounded-full bg-earth/75 text-white backdrop-blur transition hover:bg-gold hover:text-earth active:scale-95" aria-label="Photo précédente"><ArrowLeft aria-hidden="true" size={17} /></button><span className="inline-flex items-center gap-1 rounded-full bg-earth/75 px-2.5 py-1 text-xs font-bold text-white backdrop-blur"><ImageIcon aria-hidden="true" size={13} /> {imageIndex + 1}/{gallery.length}</span><button type="button" onClick={() => changeImage("next")} className="grid size-10 place-items-center rounded-full bg-earth/75 text-white backdrop-blur transition hover:bg-gold hover:text-earth active:scale-95" aria-label="Photo suivante"><ArrowRight aria-hidden="true" size={17} /></button></div>}
    <div className="relative flex h-full flex-col justify-end p-5"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.13em] text-gold"><CalendarDays aria-hidden="true" size={14} /> {event.communeAssociee}</p><h3 className="font-display mt-2 text-2xl text-white">{event.nom}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-kaolin/75">{event.sousTitre}</p><Link href={`/scan/${event.id}`} className="mt-5 inline-flex w-fit min-h-10 items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-sm font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95">En savoir plus <ArrowRight aria-hidden="true" size={16} /></Link></div>
  </article>;
}

export function EventsCarousel({ events }: { events: HeritageItem[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const move = (direction: "next" | "previous") => carouselRef.current?.scrollBy({ left: direction === "next" ? 340 : -340, behavior: "smooth" });

  return (
    <section className="relative border-y border-gold/15 bg-[#21160f]/80 px-5 py-14 sm:px-8 lg:px-10" aria-labelledby="events-title">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-2xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold"><CalendarDays aria-hidden="true" size={15} /> Fêtes & événements</p><h2 id="events-title" className="font-display mt-3 text-3xl leading-tight text-white sm:text-4xl">Les célébrations qui font vibrer le Bénin.</h2><p className="mt-4 text-sm leading-7 text-kaolin/70 sm:text-base">Fêtes traditionnelles, rendez-vous nationaux et expressions culturelles : découvre chaque histoire à ton rythme.</p></div>
          <div className="hidden gap-2 sm:flex"><button type="button" onClick={() => move("previous")} className="grid size-11 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold transition hover:bg-gold hover:text-earth active:scale-95" aria-label="Fête précédente"><ArrowLeft aria-hidden="true" size={18} /></button><button type="button" onClick={() => move("next")} className="grid size-11 place-items-center rounded-full border border-gold/35 bg-gold/10 text-gold transition hover:bg-gold hover:text-earth active:scale-95" aria-label="Fête suivante"><ArrowRight aria-hidden="true" size={18} /></button></div>
        </div>
        <div ref={carouselRef} className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
          {events.map((event) => <FestivalCard key={event.id} event={event} />)}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-kaolin/45 sm:hidden">Fais glisser les cartes pour découvrir d’autres fêtes.</p><Link href="/evenements" className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth">Voir toutes les fêtes <ArrowRight aria-hidden="true" size={16} /></Link></div>
      </div>
    </section>
  );
}
