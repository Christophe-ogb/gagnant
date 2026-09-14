import Link from "next/link";
import { PlayerProgress } from "@/components/player-progress";

export function SiteHeader() {
  return (
    <header className="relative z-30 border-b border-gold/15 bg-earth/95 px-5 py-4 text-kaolin backdrop-blur-lg sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <span className="relative grid size-12 overflow-hidden rounded-xl border border-gold/60 bg-[#2b1005] p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.18)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
            <img src="/games/logoweb_BJ.jpg.jpeg" alt="Gagnants 229" className="h-full w-full object-contain" />
          </span>
          <span className="relative block">
            <span className="absolute -left-2 -top-2 text-sm text-gold motion-safe:animate-pulse" aria-hidden="true">✦</span>
            <span className="font-display block text-[0.64rem] font-bold uppercase tracking-[0.28em] text-gold">Jeux</span>
            <span className="font-display block text-base leading-4 tracking-wide text-white transition-colors duration-300 group-hover:text-gold sm:text-lg">Gagnants <span className="inline-block motion-safe:animate-[bounce_2.2s_ease-in-out_infinite] text-gold">229</span></span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-bold text-kaolin/75 lg:flex" aria-label="Navigation principale">
          <Link href="/" className="transition hover:text-gold">Accueil</Link>
          <Link href="/#nos-jeux" className="transition hover:text-gold">Nos jeux</Link>
          <Link href="/explorer" className="transition hover:text-gold">Explorer le Bénin</Link>
          <Link href="/#temoignages" className="transition hover:text-gold">Témoignages</Link>
          <Link href="/a-propos" className="transition hover:text-gold">À propos</Link>
        </nav>
        <PlayerProgress />
      </div>
    </header>
  );
}
