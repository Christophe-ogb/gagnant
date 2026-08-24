import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, Landmark, Scale, UsersRound } from "lucide-react";

const milestones = [
  { date: "1er août 1960", title: "L’Indépendance", text: "Le pays accède à la souveraineté internationale sous le nom de République du Dahomey." },
  { date: "19–28 février 1990", title: "La Conférence des Forces Vives", text: "Ce tournant national ouvre la voie au renouveau démocratique et au pluralisme politique." },
  { date: "11 décembre 1990", title: "La Constitution", text: "La Constitution de la Ve République est promulguée après son adoption par référendum." },
];

export default function ContemporainPage() {
  return (
    <main className="min-h-screen bg-earth px-5 py-5 text-kaolin sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-4xl">
        <Link href="/explorer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-kaolin/70 transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <ArrowLeft aria-hidden="true" size={17} /> Retour aux collections
        </Link>
        <section className="mt-5 rounded-3xl border border-gold/25 bg-panel p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-10">
          <Landmark className="text-gold" aria-hidden="true" size={38} />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-gold">Gamme 03 · Bénin contemporain</p>
          <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl">De la monarchie à la République</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-kaolin/75 sm:text-base">Contrairement au pouvoir monarchique fondé sur la succession dynastique, la République du Bénin fonctionne dans un cadre constitutionnel. Cette collection aide à découvrir les institutions, les grandes figures et les étapes qui ont façonné le Bénin contemporain.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-gold/25 bg-gold/10 p-5"><UsersRound className="text-gold" aria-hidden="true" size={24} /><h2 className="font-display mt-4 text-2xl text-white">Souveraineté nationale</h2><p className="mt-3 text-sm leading-7 text-kaolin/80">Le pouvoir appartient au peuple, qui l’exerce par ses représentants élus et par la voie du référendum.</p></article>
            <article className="rounded-2xl border border-gold/25 bg-white/5 p-5"><Scale className="text-gold" aria-hidden="true" size={24} /><h2 className="font-display mt-4 text-2xl text-white">Cadre constitutionnel</h2><p className="mt-3 text-sm leading-7 text-kaolin/80">Le fonctionnement républicain organise les institutions et la séparation des pouvoirs, dans le respect de la Constitution.</p></article>
          </div>
          <section className="mt-9" aria-labelledby="reperes">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold"><CalendarDays aria-hidden="true" size={16} /> Repères historiques majeurs</p>
            <h2 id="reperes" className="font-display mt-3 text-3xl text-white">Trois dates pour comprendre le passage à l’ère républicaine</h2>
            <div className="mt-6 grid gap-4">{milestones.map((milestone) => <article key={milestone.date} className="rounded-2xl border border-white/10 bg-white/5 p-5"><p className="text-sm font-extrabold text-gold">{milestone.date}</p><h3 className="font-display mt-2 text-xl text-white">{milestone.title}</h3><p className="mt-2 text-sm leading-6 text-kaolin/75">{milestone.text}</p></article>)}</div>
          </section>
          <Link href="/contemporain/personnalites" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-3 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Voir toutes les personnalités contemporaines <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
}
