import Link from "next/link";
import { ArrowLeft, MapPinned } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-earth px-5 text-center text-kaolin">
      <section className="max-w-md rounded-3xl border border-gold/20 bg-panel/80 p-8 shadow-2xl">
        <MapPinned className="mx-auto text-gold" aria-hidden="true" size={34} />
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-gold">Carte introuvable</p>
        <h1 className="font-display mt-3 text-3xl text-white">Cette découverte attend encore son QR code.</h1>
        <p className="mt-4 text-sm leading-6 text-kaolin/70">Revenez à l’accueil pour choisir une fiche patrimoine disponible.</p>
        <Link href="/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95">
          <ArrowLeft aria-hidden="true" size={17} /> Revenir à l’accueil
        </Link>
      </section>
    </main>
  );
}
