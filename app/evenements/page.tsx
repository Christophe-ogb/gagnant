import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { HeritageDirectory } from "@/components/heritage-directory";
import { getAllHeritage } from "@/lib/heritage";

export default function EventsPage() {
  const events = getAllHeritage()
    .filter((item) => item.type === "evenement-national")
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  return (
    <main className="min-h-screen bg-earth px-5 py-5 text-kaolin sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/explorer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-kaolin/70 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><ArrowLeft aria-hidden="true" size={17} /> Retour aux collections</Link>
        <section className="mt-5 rounded-3xl border border-gold/25 bg-panel p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-9">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold"><CalendarDays aria-hidden="true" size={16} /> Fêtes & événements</p>
          <h1 className="font-display mt-3 text-4xl leading-tight text-white sm:text-5xl">Les temps forts du Bénin</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-kaolin/75 sm:text-base">Découvre les fêtes, journées culturelles et grands rendez-vous qui transmettent les patrimoines du Bénin.</p>
          <HeritageDirectory items={events} label="Fêtes & événements" />
        </section>
      </div>
    </main>
  );
}
