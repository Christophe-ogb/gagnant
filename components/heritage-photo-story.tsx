"use client";

import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import type { HeritageScene } from "@/lib/types";

type Props = { scenes: HeritageScene[]; heritageName: string; heading?: string; description?: string; itemLabel?: string };

export function HeritagePhotoStory({ scenes, heritageName, heading, description, itemLabel = "Lieu" }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loadedUrls, setLoadedUrls] = useState<string[]>([]);
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const activeScene = scenes[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === scenes.length - 1;
  const activeImageIsLoaded = loadedUrls.includes(activeScene.imageUrl);
  const activeImageFailed = failedUrls.includes(activeScene.imageUrl);

  useEffect(() => {
    const imageUrls = [...new Set(scenes.filter((scene) => !scene.imagePending).map((scene) => scene.imageUrl))];
    const preload = (url: string) => {
      const image = new window.Image();
      image.src = url;
      image.onload = () => setLoadedUrls((urls) => urls.includes(url) ? urls : [...urls, url]);
      image.onerror = () => setFailedUrls((urls) => urls.includes(url) ? urls : [...urls, url]);
    };

    imageUrls.forEach(preload);
  }, [scenes]);

  return <section id="parcours" aria-labelledby="parcours-patrimoine">
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Visite guidée</p>
      <h2 id="parcours-patrimoine" className="font-display mt-2 text-2xl text-white">{heading ?? "Viens, visitons l’histoire de chaque lieu incontournable."}</h2>
      <p className="mt-2 text-sm leading-6 text-kaolin/65">{description ?? "Choisis un repère ou utilise les flèches pour continuer la visite."}</p>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label={`Parcours de ${heritageName}`}>
      {scenes.map((scene, index) => <button key={scene.titre} type="button" role="tab" aria-selected={activeIndex === index} onClick={() => setActiveIndex(index)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${activeIndex === index ? "border-gold bg-gold text-earth" : "border-white/15 bg-white/5 text-kaolin/70 hover:border-gold/50"}`}>0{index + 1} · {scene.titre}</button>)}
    </div>
    <article className="mt-4 overflow-hidden rounded-2xl border border-gold/25 bg-panel">
      <div className="relative h-64 w-full bg-earth/60 sm:h-96">
        {activeScene.imagePending ? <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm font-bold uppercase tracking-[0.14em] text-gold"><span>Image bientôt disponible</span></div> : activeImageFailed ? <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm font-semibold text-kaolin/75"><span>Image du lieu indisponible pour le moment.</span></div> : <>
          {!activeImageIsLoaded && <div className="absolute inset-0 z-10 grid place-items-center bg-earth/65 text-xs font-bold uppercase tracking-[0.14em] text-gold">Chargement de l’image…</div>}
          <img src={activeScene.imageUrl} alt={activeScene.imageAlt} onLoad={() => setLoadedUrls((urls) => urls.includes(activeScene.imageUrl) ? urls : [...urls, activeScene.imageUrl])} onError={() => setFailedUrls((urls) => urls.includes(activeScene.imageUrl) ? urls : [...urls, activeScene.imageUrl])} className={`h-full w-full object-cover transition-opacity duration-300 ${activeImageIsLoaded ? "opacity-100" : "opacity-0"}`} />
        </>}
      </div>
      <div className="p-5 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Étape {activeIndex + 1} sur {scenes.length}</p>
        <h3 className="font-display mt-2 text-2xl text-white sm:text-3xl">{activeScene.titre}</h3>
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-gold/90"><MapPin aria-hidden="true" size={16} /> {activeScene.localisation}</p>
        <p className="mt-4 text-sm leading-7 text-kaolin/80 sm:text-base">{activeScene.texte}</p>
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <button type="button" onClick={() => setActiveIndex((index) => index - 1)} disabled={isFirst} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-kaolin/70 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><ChevronLeft aria-hidden="true" size={18} /> {itemLabel} précédent</button>
          <button type="button" onClick={() => setActiveIndex((index) => index + 1)} disabled={isLast} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-gold px-3 text-sm font-extrabold text-earth transition hover:bg-[#ebc94e] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{itemLabel} suivant <ChevronRight aria-hidden="true" size={18} /></button>
        </div>
      </div>
    </article>
  </section>;
}
