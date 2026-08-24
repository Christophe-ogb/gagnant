import Link from "next/link";
import { Compass, Gamepad2, Home, MapPinned } from "lucide-react";

const navigation = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/#nos-jeux", label: "Jeux", icon: Gamepad2 },
  { href: "/explorer", label: "Explorer", icon: Compass },
  { href: "/communes", label: "Communes", icon: MapPinned },
];

export function MobileBottomNav() {
  return <nav aria-label="Navigation mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/25 bg-[#171009]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(0,0,0,0.28)] backdrop-blur-lg lg:hidden"><div className="mx-auto grid max-w-md grid-cols-4 gap-1">{navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="flex min-h-11 min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[0.65rem] font-bold text-kaolin/70 transition hover:bg-gold/10 hover:text-gold active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><Icon aria-hidden="true" size={18} /><span className="truncate">{label}</span></Link>)}</div></nav>;
}
