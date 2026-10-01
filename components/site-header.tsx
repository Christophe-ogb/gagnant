import Link from "next/link";
import { Sparkles } from "lucide-react";
import { PlayerProgress } from "@/components/player-progress";

const navigation = [
  { href: "/", label: "Accueil" },
  { href: "/#nos-jeux", label: "Nos jeux" },
  { href: "/explorer", label: "Explorer le B\u00e9nin" },
  { href: "/tourisme", label: "Tourisme" },
  { href: "/#temoignages", label: "T\u00e9moignages" },
  { href: "/a-propos", label: "\u00c0 propos" },
];

export function SiteHeader() {
  return <header id="site-header" translate="no" className="fixed inset-x-0 top-0 z-50 border-b border-gold/15 bg-earth/95 px-4 py-3 text-kaolin backdrop-blur-lg sm:px-8 lg:px-10">
    <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 sm:gap-5">
      <Link href="/" aria-label="Accueil Gagnants 229" className="group flex min-w-0 shrink items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
        <span className="relative grid size-11 shrink-0 overflow-hidden rounded-xl border border-gold/60 bg-[#2b1005] p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.18)] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105 sm:size-12"><img src="/games/logoweb_BJ.jpg.jpeg" alt="Gagnants 229" className="h-full w-full object-contain" /></span>
        <span className="relative hidden min-w-0 sm:block"><Sparkles className="absolute -left-2 -top-2 text-gold motion-safe:animate-pulse" aria-hidden="true" size={14} /><span className="font-display block text-[0.64rem] font-bold uppercase tracking-[0.28em] text-gold">Jeux</span><span className="font-display block truncate text-base leading-4 tracking-wide text-white transition-colors duration-300 group-hover:text-gold sm:text-lg">Gagnants <span className="inline-block text-gold">229</span></span></span>
      </Link>
      <nav className="hidden items-center gap-5 text-sm font-bold text-kaolin/75 lg:flex" aria-label="Navigation principale">{navigation.map((link) => <Link key={link.href} href={link.href} className="whitespace-nowrap transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{link.label}</Link>)}</nav>
      <div className="shrink-0"><PlayerProgress /></div>
    </div>
  </header>;
}
