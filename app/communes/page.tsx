import Link from "next/link";
import { ArrowLeft, MapPinned, ScanLine, Trophy } from "lucide-react";
import { CommuneDirectory } from "@/components/commune-directory";
import { PlayerProgress } from "@/components/player-progress";
import { getAllHeritage } from "@/lib/heritage";
import { departments } from "@/lib/departements";
import { ReturnToExploration } from "@/components/return-to-exploration";

export default async function CommunesPage({ searchParams }: { searchParams: Promise<{ dept?: string }> }) {
  const { dept } = await searchParams;
  const selectedDepartment = departments.find((department) => department.slug === dept);
  const communes = getAllHeritage()
    .filter((item) => item.type === "commune" && (!selectedDepartment || selectedDepartment.communes.includes(item.id)))
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  const readyCount = communes.filter((item) => item.isReady !== false).length;
  const title = selectedDepartment ? `Communes du ${selectedDepartment.nom}` : "Explore les 77 communes du B&#233;nin";

  return <main className="min-h-screen bg-earth px-5 py-5 text-kaolin sm:px-8 sm:py-8">
    <div className="mx-auto w-full max-w-6xl">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <span className="grid size-11 place-items-center rounded-full border border-gold/45 bg-gold/10 text-gold"><Trophy aria-hidden="true" size={21} /></span>
          <span className="font-display text-lg text-white">GAGNANTS 229</span>
        </Link>
        <PlayerProgress />
      </header>
      <ReturnToExploration href={selectedDepartment ? "/departements" : "/"} label={selectedDepartment ? "Retour \u00e0 tous les d\u00e9partements" : "Retour \u00e0 l\u2019accueil"} className="mt-9" />
      <section className="mt-5 rounded-3xl border border-gold/25 bg-panel p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-9">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold"><MapPinned aria-hidden="true" size={16} /> Gamme 01 &#183; Territoires</p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl leading-tight text-white sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-kaolin/75 sm:text-base">Tu n&apos;as pas besoin d&apos;un QR code pour commencer. Choisis une commune et d&#233;couvre sa fiche. Les QR codes sur les jeux physiques m&#232;nent simplement vers cette m&#234;me fiche.</p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold"><ScanLine aria-hidden="true" size={15} /> {readyCount} parcours disponible{readyCount > 1 ? "s" : ""} &#183; les autres arrivent progressivement</p>
        <CommuneDirectory communes={communes} />
      </section>
    </div>
  </main>;
}
