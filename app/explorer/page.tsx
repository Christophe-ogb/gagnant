import Link from "next/link";
import { ArrowLeft, ArrowRight, Crown, Landmark, MapPinned, Trophy } from "lucide-react";
// import { CalendarDays } from "lucide-react";
import { getAllHeritage } from "@/lib/heritage";

export default function ExplorerPage() {
  const heritage = getAllHeritage();
  const collections = [
    { href: "/communes", title: "Les 77 communes", description: "Territoires, paysages, traditions et défis locaux.", icon: MapPinned, count: heritage.filter((item) => item.type === "commune").length, label: "communes" },
    { href: "/royaumes", title: "Royaumes & Histoire", description: "Rois, reines, héros et mémoires dynastiques.", icon: Crown, count: heritage.filter((item) => item.type === "roi").length, label: "figures" },
    { href: "/contemporain/personnalites", title: "Bénin contemporain", description: "Présidents, artistes et personnalités qui font vivre le Bénin.", icon: Landmark, count: heritage.filter((item) => item.type === "contemporain").length, label: "personnalités" },
    // Collection Fêtes & événements temporairement masquée.
    // Pour la remettre : décommente aussi l'import `CalendarDays` ci-dessus.
    // { href: "/evenements", title: "Fêtes & événements", description: "Célébrations, journées culturelles et repères nationaux.", icon: CalendarDays, count: heritage.filter((item) => item.type === "evenement-national").length, label: "événements" },
  ];

  return (
    <main className="min-h-screen bg-earth px-5 py-5 text-kaolin sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-kaolin/70 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><ArrowLeft aria-hidden="true" size={17} /> Retour à l’accueil</Link>
        <section className="mt-5 rounded-3xl border border-gold/25 bg-panel p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Explorer le Bénin</p>
          <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl">Choisis ta collection</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-kaolin/75 sm:text-base">Tu peux découvrir le contenu même sans QR code. Les QR codes des jeux ouvrent directement les mêmes fiches.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {collections.map((collection) => { const Icon = collection.icon; return <Link key={collection.href} href={collection.href} className="group rounded-2xl border border-gold/20 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-gold/55 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><Icon className="text-gold" aria-hidden="true" size={28} /><p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-gold">{collection.count} {collection.label}</p><h2 className="font-display mt-2 text-2xl text-white">{collection.title}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-kaolin/70">{collection.description}</p><span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-gold">Ouvrir <ArrowRight aria-hidden="true" size={16} /></span></Link>; })}
          </div>
        </section>
      </div>
    </main>
  );
}
