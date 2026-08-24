import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const footerLinks = [
  { href: "/", label: "Accueil" },
  { href: "/#nos-jeux", label: "Nos jeux" },
  { href: "/explorer", label: "Explorer le Bénin" },
  { href: "/communes", label: "Les 77 communes" },
  { href: "/royaumes", label: "Royaumes & histoire" },
  { href: "/contemporain", label: "Bénin contemporain" },
  { href: "/a-propos", label: "À propos" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-gold/20 bg-[#120c08] px-5 py-10 text-kaolin sm:px-8 lg:px-10">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <span className="relative grid size-12 overflow-hidden rounded-full border border-gold/45 bg-gold/10">
              <img src="/games/logo-gagnants.jpeg" alt="Logo Jeux Gagnants" className="absolute inset-0 h-full w-full object-cover" />
            </span>
            <span>
              <span className="font-display block text-xs tracking-[0.2em] text-gold">JEUX</span>
              <span className="font-display block text-lg leading-4 text-white">GAGNANTS</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-kaolin/65">Des jeux de société pour jouer, partager et faire découvrir l’histoire et le patrimoine du Bénin.</p>
        </div>

        <nav aria-label="Liens du pied de page">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Navigation</h2>
          <ul className="mt-4 grid gap-3 text-sm text-kaolin/70">
            {footerLinks.map((link) => <li key={link.href}><Link href={link.href} className="transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{link.label}</Link></li>)}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Suivez-nous</h2>
          <a href="https://www.facebook.com/share/186k87YHaF/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-3 rounded-xl border border-gold/35 bg-gold/10 px-4 py-3 text-sm font-bold text-gold transition hover:bg-gold hover:text-earth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <span className="grid size-7 place-items-center rounded-md bg-[#1877f2] font-bold text-lg text-white" aria-hidden="true">f</span>
            Facebook <ArrowUpRight aria-hidden="true" size={16} />
          </a>
          <p className="mt-4 max-w-xs text-xs leading-6 text-kaolin/50">Retrouvez les actualités, les jeux et les nouveautés de Jeux Gagnants.</p>
        </div>
      </div>
      <div className="mx-auto mt-10 flex w-full max-w-6xl flex-col gap-2 border-t border-white/10 pt-5 text-xs text-kaolin/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Jeux Gagnants</p>
        <p>Jouons notre histoire.</p>
      </div>
    </footer>
  );
}
