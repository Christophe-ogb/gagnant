import Link from "next/link";
import { PlayerProgress } from "@/components/player-progress";

export function SiteHeader() {
  return (
    <header className="relative z-30 border-b border-gold/15 bg-earth/95 px-5 py-4 text-kaolin backdrop-blur-lg sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <span className="relative grid size-11 overflow-hidden rounded-full border border-gold/45 bg-gold/10">
            <img src="/games/logo-gagnants.jpeg" alt="Logo Jeux Gagnants" className="absolute inset-0 h-full w-full object-cover" />
          </span>
          <span>
            <span className="font-display block text-[0.72rem] tracking-[0.2em] text-gold">JEUX</span>
            <span className="font-display block text-lg leading-4 tracking-wide text-white">GAGNANTS</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-bold text-kaolin/75 lg:flex" aria-label="Navigation principale">
          <Link href="/" className="transition hover:text-gold">Accueil</Link>
          <Link href="/#nos-jeux" className="transition hover:text-gold">Nos jeux</Link>
          <Link href="/explorer" className="transition hover:text-gold">Explorer le Bénin</Link>
          <Link href="/a-propos" className="transition hover:text-gold">À propos</Link>
        </nav>
        <PlayerProgress />
      </div>
    </header>
  );
}
