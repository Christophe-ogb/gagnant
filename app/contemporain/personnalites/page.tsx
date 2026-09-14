import Link from "next/link";
import { ArrowLeft, ArrowRight, Landmark, Trophy } from "lucide-react";
import { PlayerProgress } from "@/components/player-progress";
import { getAllHeritage } from "@/lib/heritage";

export default function ContemporaryFiguresPage() {
  const figures = getAllHeritage().filter((heritage) => heritage.type === "contemporain");

  return (
    <main className="min-h-screen bg-earth px-5 py-5 text-kaolin sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <span className="grid size-11 place-items-center rounded-full border border-gold/45 bg-gold/10 text-gold"><Trophy aria-hidden="true" size={21} /></span>
            <span className="font-display text-lg text-white">GAGNANTS 229</span>
          </Link>
          <PlayerProgress />
        </header>

        <Link href="/#communes" className="mt-9 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-kaolin/70 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <ArrowLeft aria-hidden="true" size={17} /> Retour à l’accueil
        </Link>

        <section className="mt-5">
          <Landmark className="text-gold" aria-hidden="true" size={38} />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-gold">Gamme 03 · Bénin contemporain</p>
          <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl">Présidents et personnalités</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-kaolin/75 sm:text-base">Découvrez les figures qui ont marqué la République du Bénin, ses institutions, sa transition démocratique et son développement.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {figures.map((figure) => (
              <article key={figure.id} className="group overflow-hidden rounded-2xl border border-gold/20 bg-panel transition duration-300 hover:-translate-y-1 hover:border-gold/55">
                <img src={figure.imageUrl} alt={figure.imageAlt} className="h-48 w-full object-cover object-[center_22%] transition duration-500 group-hover:scale-105" />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-gold">Personnalité contemporaine</p>
                  <h2 className="font-display mt-2 text-2xl text-white">{figure.nom}</h2>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-kaolin/65">{figure.sousTitre}</p>
                  <Link href={`/scan/${figure.id}`} className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-gold transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Découvrir la fiche <ArrowRight aria-hidden="true" size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
