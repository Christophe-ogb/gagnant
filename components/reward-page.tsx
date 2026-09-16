"use client";

import Link from "next/link";
import { Crown, Home, Share2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

type RewardPageProps = {
  heritageName?: string;
  badgeName?: string;
};

export function RewardPage({ heritageName, badgeName }: RewardPageProps) {
  const searchParams = useSearchParams();
  const player = searchParams.get("user") || "Joueur Gagnants 229";
  const score = searchParams.get("score") || "0";
  const heritage = (heritageName || searchParams.get("heritage") || "le patrimoine béninois").replace(/^commune\s+(de\s+)?/i, "").trim();
  const badge = badgeName || searchParams.get("badge") || "Badge du patrimoine";
  const isCompleted = searchParams.get("status") !== "progress";
  const grade = isCompleted ? `Gardien du Patrimoine de ${heritage}` : `Explorateur de ${heritage}`;

  async function shareReward() {
    const shareText = `${player} a obtenu ${score} points sur l’épreuve de ${heritage} avec Gagnants 229 !`;
    if (navigator.share) {
      await navigator.share({ title: "Gagnants 229", text: shareText, url: window.location.href });
      return;
    }
    await navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
  }

  return (
    <main className="min-h-screen bg-earth px-4 py-8 text-kaolin sm:px-8 sm:py-14">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-gold/60 bg-panel shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="relative overflow-hidden border-b border-gold/25 bg-[radial-gradient(circle_at_85%_10%,rgba(212,175,55,0.25),transparent_35%)] px-5 py-8 sm:px-10 sm:py-10">
          <div className="flex items-center justify-center gap-3"><span className="grid size-14 overflow-hidden rounded-xl border border-gold/60 bg-[#2b1005] p-0.5"><img src="/games/logoweb_BJ.jpg.jpeg" alt="Logo Gagnants 229" className="h-full w-full object-contain" /></span><span className="font-display text-xl tracking-wide text-white">JEUX <strong className="text-gold">GAGNANTS 229</strong></span></div>
          <div className="mx-auto mt-7 grid size-20 place-items-center rounded-full border-2 border-gold bg-gold/15 text-gold shadow-[0_0_40px_rgba(212,175,55,0.32)]"><Crown aria-hidden="true" size={38} /></div>
          <p className="font-display mt-6 text-2xl tracking-wide text-white sm:text-3xl">{isCompleted ? "VICTOIRE ÉCLATANTE !" : "PARCOURS EN COURS"}</p>
        </div>
        <div className="p-5 text-center sm:p-10">
          <p className="text-sm text-kaolin/70">Félicitations,</p>
          <p className="font-display mt-1 text-3xl text-white sm:text-4xl">{player}</p>
          <p className="font-display mt-6 text-4xl text-gold sm:text-5xl">+{score} <span className="text-lg sm:text-xl">POINTS</span></p>
          <p className="mt-4 text-sm leading-6 text-kaolin/70">Épreuve de {heritage}</p>
          <p className="mt-3 font-bold text-gold">👑 {grade}</p>
          <p className="mt-7 text-xs italic leading-6 text-kaolin/55">« Peux-tu battre mon score sur Gagnants 229 ? »</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={shareReward} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95"><Share2 aria-hidden="true" size={18} /> Partager ma récompense</button>
            <Link href="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gold/45 bg-gold/10 px-5 py-3 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth active:scale-95"><Home aria-hidden="true" size={18} /> Retour à l’accueil</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
