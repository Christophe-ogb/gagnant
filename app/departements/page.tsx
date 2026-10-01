import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { departments } from "@/lib/departements";
import { ReturnToExploration } from "@/components/return-to-exploration";

export default function DepartementsPage() {
  return <main className="min-h-screen bg-earth px-5 py-10 text-kaolin sm:px-8 lg:px-10">
    <div className="mx-auto max-w-7xl">
      <h1 className="font-display text-4xl text-white sm:text-5xl">Les 12 d&#233;partements du B&#233;nin</h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-kaolin/70 sm:text-base">Choisis un d&#233;partement pour retrouver ses communes. Chaque commune ouvre sa fiche, son histoire et son ar&#232;ne d&#233;j&#224; existantes.</p>
      <ReturnToExploration href="/explorer" label="Retour \u00e0 Explorer le B\u00e9nin" className="mt-5 rounded-xl border border-gold/45 bg-gold/10 px-4 text-gold hover:bg-gold hover:text-earth" />
      <div className="mt-6 grid overflow-hidden rounded-3xl border border-gold/25 bg-panel sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {departments.map((department, index) => <Link key={department.slug} href={`/departements/${department.slug}`} className="group min-h-44 border-b border-r border-white/10 p-6 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <p className="text-xs font-bold text-gold/75">{String(index + 1).padStart(2, "0")}</p>
          <h2 className="font-display mt-3 text-2xl text-white">{department.nom}</h2>
          <p className="mt-1 text-sm text-kaolin/75">{department.communes.length} commune{department.communes.length > 1 ? "s" : ""}</p>
          <p className="mt-5 text-xs text-kaolin/55">Chef-lieu &#183; {department.chefLieu}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-gold">Voir les communes <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
        </Link>)}
      </div>
      <Link href="/communes" className="mt-8 inline-flex text-sm font-bold text-gold hover:text-white">Voir aussi les 77 communes</Link>
    </div>
  </main>;
}
