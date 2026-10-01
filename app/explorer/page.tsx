import Link from "next/link";
import { ArrowLeft, ArrowRight, Crown, Landmark, MapPinned, Trophy } from "lucide-react";
// import { CalendarDays } from "lucide-react";
import { getAllHeritage } from "@/lib/heritage";
import { ReturnToExploration } from "@/components/return-to-exploration";

export default function ExplorerPage() {
  const heritage = getAllHeritage();
  const collections = [
    { href: "/departements", title: "Les 12 dÃ©partements", description: "Choisis un d\u00e9partement puis dÃ©couvre ses communes.", icon: MapPinned, count: 12, label: "dÃ©partements" },
    { href: "/communes", title: "Les 77 communes", description: "Territoires, paysages, traditions et dÃ©fis locaux.", icon: MapPinned, count: heritage.filter((item) => item.type === "commune").length, label: "communes" },
    { href: "/royaumes", title: "Royaumes & Histoire", description: "Rois, reines, hÃ©ros et mÃ©moires dynastiques.", icon: Crown, count: heritage.filter((item) => item.type === "roi").length, label: "figures" },
    { href: "/contemporain/personnalites", title: "BÃ©nin contemporain", description: "PrÃ©sidents, artistes et personnalitÃ©s qui font vivre le BÃ©nin.", icon: Landmark, count: heritage.filter((item) => item.type === "contemporain").length, label: "personnalitÃ©s" },
    // Collection FÃªtes & Ã©vÃ©nements temporairement masquÃ©e.
    // Pour la remettre : dÃ©commente aussi l'import `CalendarDays` ci-dessus.
    // { href: "/evenements", title: "FÃªtes & Ã©vÃ©nements", description: "CÃ©lÃ©brations, journÃ©es culturelles et repÃ¨res nationaux.", icon: CalendarDays, count: heritage.filter((item) => item.type === "evenement-national").length, label: "Ã©vÃ©nements" },
  ];

  return (
    <main className="min-h-screen bg-earth px-5 py-5 text-kaolin sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <ReturnToExploration href="/" label="Retour \u00e0 l\u2019accueil" className="mt-3" />
        <section className="mt-5 rounded-3xl border border-gold/25 bg-panel p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Explorer le BÃ©nin</p>
          <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl">Choisis ta collection</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-kaolin/75 sm:text-base">Tu peux dÃ©couvrir le contenu mÃªme sans QR code. Les QR codes des jeux ouvrent directement les mÃªmes fiches.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {collections.map((collection) => { const Icon = collection.icon; return <Link key={collection.href} href={collection.href} className="group rounded-2xl border border-gold/20 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-gold/55 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><Icon className="text-gold" aria-hidden="true" size={28} /><p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-gold">{collection.count} {collection.label}</p><h2 className="font-display mt-2 text-2xl text-white">{collection.title}</h2><p className="mt-3 min-h-12 text-sm leading-6 text-kaolin/70">{collection.description}</p><span className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-gold">Ouvrir <ArrowRight aria-hidden="true" size={16} /></span></Link>; })}
          </div>
        </section>
      </div>
    </main>
  );
}
