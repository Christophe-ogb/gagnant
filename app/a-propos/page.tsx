import Link from "next/link";
import { ArrowLeft, ExternalLink, Gamepad2, ScanLine, Trophy } from "lucide-react";
import { PlayerProgress } from "@/components/player-progress";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-earth px-5 py-5 text-kaolin sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <span className="relative grid size-12 overflow-hidden rounded-xl border border-gold/60 bg-[#2b1005] p-0.5 shadow-[0_0_24px_rgba(212,175,55,0.18)]">
              <img src="/games/logoweb_BJ.jpg.jpeg" alt="Logo Gagnants 229" className="h-full w-full object-contain" />
            </span>
          </Link>
          <PlayerProgress />
        </header>

        <Link href="/" className="mt-9 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-kaolin/70 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <ArrowLeft aria-hidden="true" size={17} /> Retour à l’accueil
        </Link>

        <section className="mt-5 border-b border-gold/20 pb-12 pt-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">À propos de Gagnants 229</p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl leading-tight text-white sm:text-6xl">Jouer pour faire connaître le Bénin.</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-kaolin/75 sm:text-lg">Gagnants 229 crée des jeux de société inspirés de l’histoire, des territoires et des cultures du Bénin. Notre objectif est simple : donner envie de jouer, de partager et de découvrir notre pays.</p>
        </section>

        <section className="grid gap-5 border-b border-gold/20 py-12 md:grid-cols-3" aria-label="Notre démarche">
          <article>
            <Gamepad2 className="text-gold" aria-hidden="true" size={30} />
            <h2 className="font-display mt-5 text-2xl text-white">Des jeux à partager</h2>
            <p className="mt-3 text-sm leading-7 text-kaolin/70">Dames des 77 Communes, Ludo des Royaumes et Cartes du Bénin sont pensés pour les familles, les amis, les écoles et les amoureux du patrimoine.</p>
          </article>
          <article>
            <ScanLine className="text-gold" aria-hidden="true" size={30} />
            <h2 className="font-display mt-5 text-2xl text-white">Une histoire après la partie</h2>
            <p className="mt-3 text-sm leading-7 text-kaolin/70">Les QR codes présents dans les jeux donnent accès à des fiches sur les communes, les royaumes, les personnalités et les lieux du Bénin.</p>
          </article>
          <article>
            <Trophy className="text-gold" aria-hidden="true" size={30} />
            <h2 className="font-display mt-5 text-2xl text-white">La transmission par le jeu</h2>
            <p className="mt-3 text-sm leading-7 text-kaolin/70">Chaque partie devient une occasion de retenir un nom, un lieu, une date ou un récit, puis de le transmettre à son tour.</p>
          </article>
        </section>

        <section className="py-12" aria-labelledby="collection">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Notre collection</p>
          <h2 id="collection" className="font-display mt-3 text-3xl text-white sm:text-4xl">Le Bénin comme terrain de jeu</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-kaolin/75 sm:text-base">
            <p><strong className="text-white">Dames des 77 Communes</strong> fait connaître les communes et leurs départements dans une mécanique familière de jeu de dames.</p>
            <p><strong className="text-white">Ludo des Royaumes</strong> invite à traverser un univers de rois, de reines, de guerriers, de messagers et de grandes mémoires historiques.</p>
            <p><strong className="text-white">Cartes du Bénin</strong> ouvre une collection autour des royaumes, des héros, des communes, du patrimoine et de la nature.</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/#nos-jeux" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Voir nos jeux</Link>
            <a href="https://www.facebook.com/share/186k87YHaF/" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-3 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><ExternalLink aria-hidden="true" size={18} /> Suivre Gagnants 229 sur Facebook</a>
          </div>
        </section>
      </div>
    </main>
  );
}
