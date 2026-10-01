import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { departments } from "@/lib/departements";
import { ReturnToExploration } from "@/components/return-to-exploration";
import { getAllHeritage } from "@/lib/heritage";

export function generateStaticParams() { return departments.map(({ slug }) => ({ slug })); }
export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const department = departments.find((item) => item.slug === slug); if (!department) notFound();
  const communes = department.communes.map((id) => getAllHeritage().find((item) => item.id === id)).filter(Boolean);
  return <main className="min-h-screen bg-earth px-5 py-10 text-kaolin sm:px-8 lg:px-10"><div className="mx-auto max-w-6xl">
    <section className="mt-6 rounded-3xl border border-gold/25 bg-panel p-7 sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">{department.region}</p><h1 className="font-display mt-3 text-5xl text-white">{department.nom}</h1><p className="mt-3 text-kaolin/75">Chef-lieu &#183; {department.chefLieu} &#183; {department.communes.length} communes</p></section>
    <ReturnToExploration href="/departements" label="Retour \u00e0 tous les d\u00e9partements" className="mt-5 rounded-xl border border-gold/45 bg-gold/10 px-4 text-gold hover:bg-gold hover:text-earth" />
    <h2 className="font-display mt-8 text-3xl text-white">Les communes du {department.nom}</h2>
    <div className="mt-5 grid gap-3">{communes.map((commune, index) => commune && <Link key={commune.id} href={`/scan/${commune.id}`} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-panel p-4 transition hover:border-gold/60 hover:bg-white/5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold/10 text-sm font-bold text-gold">{index + 1}</span><img src={commune.imageUrl} alt="" className="size-14 rounded-xl object-cover" /><span className="min-w-0 flex-1"><strong className="font-display block text-xl text-white">{commune.nom}</strong><span className="mt-1 block truncate text-sm text-kaolin/65">{commune.sousTitre}</span></span><MapPin size={17} className="text-gold" /><ArrowRight size={18} className="text-gold transition group-hover:translate-x-1" /></Link>)}</div>
  </div></main>;
}
