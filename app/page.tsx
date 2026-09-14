import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Crown,
  Gamepad2,
  MapPinned,
  MessageCircle,
  MessageSquareQuote,
  ScanLine,
} from "lucide-react";
import { PlayerProgress } from "@/components/player-progress";
import { DestinationCarousel } from "@/components/destination-carousel";
// Section des fêtes conservée pour une prochaine mise en ligne.
// import { EventsCarousel } from "@/components/events-carousel";
import { VisitorCounter } from "@/components/visitor-counter";
import { TestimonialForm } from "@/components/testimonial-form";
import { PublishedTestimonials } from "@/components/published-testimonials";
import { getAllHeritage } from "@/lib/heritage";

const communeIds = new Set(["ouidah", "abomey", "ganvie", "natitingou"]);
const kingIds = ["behanzin", "toffa-1er", "bio-guerra", "roi-alade-ife"];
const contemporaryIds = new Set(["thomas-boni-yayi", "patrice-talon"]);
const destinationTaglines: Record<string, string> = {
  ouidah: "Mémoires, rites et océan",
  "porto-novo": "La capitale aux trois noms",
  dangbo: "La porte de la vallée de l’Ouémé",
  allada: "Aux sources d’un grand royaume",
  ze: "Au cœur de la civilisation Aïzo",
  cotonou: "Le poumon cosmopolite du Bénin",
};
const orderMessage = "Bonjour Gagnants 229, je souhaite commander un jeu. Je voudrais choisir d'autres personnages et motifs personnalisés selon mes goûts.";

export default function Home() {
  const communes = getAllHeritage().filter((heritage) => communeIds.has(heritage.id));
  const allHeritage = getAllHeritage();
  const kings = kingIds
    .map((id) => allHeritage.find((heritage) => heritage.id === id))
    .filter((heritage): heritage is NonNullable<typeof heritage> => Boolean(heritage));
  const contemporaryFigures = getAllHeritage().filter((heritage) => contemporaryIds.has(heritage.id));
  const destinations = Object.keys(destinationTaglines).map((id) => getAllHeritage().find((heritage) => heritage.id === id)).filter((heritage): heritage is NonNullable<typeof heritage> => Boolean(heritage)).map((heritage) => ({ ...heritage, tagline: destinationTaglines[heritage.id] }));
  // const events = getAllHeritage().filter((heritage) => heritage.type === "evenement-national");

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-earth text-kaolin">
      <div className="hero-orb hero-orb-top" />
      <div className="hero-orb hero-orb-bottom" />

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 pb-6 pt-5 sm:px-8 lg:px-10">
        <Link href="/" className="group flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
          <span className="relative grid size-12 overflow-hidden rounded-xl border border-gold/60 bg-[#2b1005] p-0.5 shadow-[0_0_24px_rgba(212,175,55,0.18)] transition-transform duration-200 group-hover:-rotate-2">
            <img src="/games/logoweb_BJ.jpg.jpeg" alt="Logo Gagnants 229" className="h-full w-full object-contain" />
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-bold text-kaolin/75 lg:flex" aria-label="Navigation principale">
          <Link href="/" className="transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Accueil</Link>
          <Link href="#nos-jeux" className="transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Nos jeux</Link>
          <Link href="/explorer" className="transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Explorer le Bénin</Link>
          <Link href="/a-propos" className="transition hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">À propos</Link>
        </nav>

        <div className="flex items-center gap-3">
          <PlayerProgress />
        </div>
      </header>

      <section className="relative mx-auto flex w-full max-w-6xl flex-col px-5 pb-20 pt-10 sm:px-8 sm:pt-16 lg:px-10 lg:pt-24">
        <img src="/games/amazone.jpg" alt="Amazone béninoise, image de patrimoine et de mémoire" className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[60%_25%] opacity-35" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(26,18,11,0.98)_0%,rgba(26,18,11,0.82)_42%,rgba(26,18,11,0.3)_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(0deg,#1a120b_0%,transparent_42%)]" />
        <div className="max-w-3xl">
          {/* <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold sm:text-sm">
            <span className="h-px w-8 bg-gold/70" /> Vodun Days · Bénin
          </p> */}
          <h1 className="font-display max-w-3xl text-4xl leading-[1.08] text-white sm:text-6xl lg:text-7xl">
            Et si on jouait <span className="text-gold">notre histoire</span> ?
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-kaolin/75 sm:text-lg sm:leading-8">
            Scannez. Découvrez les mémoires du Bénin. Relevez le défi et devenez un explorateur du patrimoine.
          </p>
        </div>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/scan/ouidah" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth shadow-[0_14px_36px_rgba(212,175,55,0.2)] transition duration-200 hover:bg-[#ebc94e] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <ScanLine aria-hidden="true" size={19} /> Simuler un Scan QR Code
          </Link>
          <Link href="/explorer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gold/30 bg-white/5 px-5 py-3 text-sm font-bold text-kaolin backdrop-blur-sm transition duration-200 hover:border-gold/70 hover:bg-white/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            Explorer le Bénin <ArrowDown aria-hidden="true" size={17} />
          </Link>
        </div>

        <p className="mt-5 text-xs text-kaolin/50">Aucune inscription requise · Votre progression reste sur ce téléphone.</p>

      </section>

      <section id="nos-jeux" className="relative border-y border-gold/20 bg-[#21160f]/90 px-5 py-16 sm:px-8 lg:px-10" aria-labelledby="jeux-gagnants">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold"><Gamepad2 aria-hidden="true" size={16} /> Les jeux à jouer et à partager</p>
            <h2 id="jeux-gagnants" className="font-display mt-3 text-3xl leading-tight text-white sm:text-5xl">Le patrimoine béninois devient un jeu de société.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-kaolin/75">Découvrez nos jeux inspirés du Bénin, jouez en famille ou entre amis, puis scannez les communes et les personnages pour prolonger la partie par une histoire.</p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            <article className="group overflow-hidden rounded-2xl border border-gold/50 bg-panel shadow-[0_20px_50px_rgba(0,0,0,0.2)] lg:col-span-2">
              <div className="relative aspect-[16/8] overflow-hidden">
                <img src="/games/dames-77-communes.jpeg" alt="Jeu de dames des 77 communes" className="absolute inset-0 h-full w-full bg-[#f4f1ea] object-contain p-2" />
                <span className="absolute left-4 top-4 rounded-full border border-gold/60 bg-earth/85 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-gold">Jeu phare</span>
              </div>
              <div className="p-5 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Dames des 77 Communes</p>
                <h3 className="font-display mt-2 text-2xl text-white sm:text-3xl">Jouez le Bénin, case après case.</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-kaolin/70">Une partie de dames familière, enrichie par les 77 communes, leurs départements et des défis de connaissance. Une manière simple de faire découvrir le pays en jouant.</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link href="/communes" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-gold px-2 py-2.5 text-center text-xs font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Découvrir les communes <ArrowRight aria-hidden="true" size={16} /></Link>
                  <a href={`https://wa.me/2290141757539?text=${encodeURIComponent("Bonjour Gagnants 229, je souhaite commander un jeu dames.")}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#25d366] px-2 py-2.5 text-center text-xs font-extrabold text-[#062b15] transition hover:bg-[#4ade80] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><MessageCircle aria-hidden="true" size={16} /> Commander</a>
                </div>
              </div>
            </article>

            <article className="group overflow-hidden rounded-2xl border border-gold/25 bg-panel">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src="/games/ludo-des-royaumes.jpeg" alt="Jeu Ludo des Royaumes" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Ludo des Royaumes</p>
                <h3 className="font-display mt-2 text-2xl text-white">Traversez les grandes histoires.</h3>
                <p className="mt-3 text-sm leading-6 text-kaolin/70">Un Ludo inspiré des rois, des cours et des personnages historiques du Bénin.</p>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link href="/royaumes" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-gold px-2 py-2.5 text-center text-xs font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Explorer les royaumes <ArrowRight aria-hidden="true" size={16} /></Link>
                  <a href={`https://wa.me/2290141757539?text=${encodeURIComponent("Bonjour Gagnants 229, je souhaite commander un jeu de ludo.")}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#25d366] px-2 py-2.5 text-center text-xs font-extrabold text-[#062b15] transition hover:bg-[#4ade80] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><MessageCircle aria-hidden="true" size={16} /> Commander</a>
                </div>
              </div>
            </article>

            <article className="group overflow-hidden rounded-2xl border border-gold/25 bg-panel lg:col-span-3 lg:flex">
              <div className="relative min-h-64 bg-[#2b1005] lg:w-72 lg:shrink-0">
                <img src="/games/logoweb_BJ.jpg.jpeg" alt="Logo Gagnants 229" className="absolute inset-0 h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5 sm:p-7 lg:w-2/3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Cartes du Bénin</p>
                <h3 className="font-display mt-2 text-2xl text-white sm:text-3xl">Collectionnez, apprenez, rejouez.</h3>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-kaolin/70">Une collection de cartes consacrée aux royaumes, héros, communes, patrimoines et paysages du Bénin, pensée pour le jeu classique, les quiz et la transmission.</p>
                <Link href="/explorer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Voir la collection <ArrowRight aria-hidden="true" size={17} /></Link>
              </div>
            </article>
          </div>
          <div className="mt-8 flex flex-col items-start gap-3 border-t border-gold/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-kaolin/70">Tu veux commander un jeu avec les motifs QR de ton choix ?</p>
            <a href={`https://wa.me/2290141757539?text=${encodeURIComponent(orderMessage)}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#25d366] px-4 py-2.5 text-sm font-extrabold text-[#062b15] transition hover:bg-[#4ade80] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              <MessageCircle aria-hidden="true" size={18} /> Commander sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/*
        Section Fêtes & événements temporairement masquée.
        Pour la réafficher, décommente aussi l'import et la constante `events` ci-dessus.
        <EventsCarousel events={events} />
      */}

      <DestinationCarousel destinations={destinations} />

      <section id="communes" className="relative border-t border-gold/15 bg-[#21160f]/80 px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold"><MapPinned aria-hidden="true" size={15} /> Gamme 01 · Territoires</p>
            <h2 className="font-display mt-3 text-3xl leading-tight text-white sm:text-4xl">Les communes du Bénin</h2>
            <p className="mt-4 leading-7 text-kaolin/70">Commencez votre tour du Bénin par quatre territoires. Chaque carte ouvre une histoire, puis un défi à relever.</p>
          </div>
          <div className="-mx-3 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {communes.map((commune) => (
              <article key={commune.id} className="group w-[82vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-panel transition duration-300 hover:-translate-y-1 hover:border-gold/55 sm:w-auto">
                <img src={commune.imageUrl} alt={commune.imageAlt} className="h-42 w-full object-cover object-[center_35%] transition duration-500 group-hover:scale-105" />
                <div className="p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-gold">Commune</p>
                  <h3 className="font-display mt-2 text-2xl text-white">{commune.nom}</h3>
                  <p className="mt-1 min-h-10 text-sm leading-5 text-kaolin/65">{commune.sousTitre}</p>
                  <Link href={`/scan/${commune.id}`} className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-gold transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                    En savoir plus <ArrowRight aria-hidden="true" size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <Link href="/communes" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-3 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Voir les 77 communes <ArrowRight aria-hidden="true" size={17} /></Link>

          <section className="mt-16">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold"><Crown aria-hidden="true" size={15} /> Gamme 02 · Royaumes & histoire</p>
              <h2 className="font-display mt-3 text-3xl leading-tight text-white sm:text-4xl">Découvrons les rois qui font la fierté de notre pays, le Bénin, autrefois appelé Dahomey.</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-kaolin/70 sm:text-base">
                <p>Dans le Royaume du Danxomè (Abomey) et le Royaume de Hogbonu (Porto-Novo), le pouvoir repose sur une monarchie sacrée :</p>
                <ul className="space-y-3 border-l border-gold/35 pl-4">
                  <li><strong className="text-kaolin">Prise du trône :</strong> le roi est désigné parmi les princes (<em>Vidaho</em>) par un conseil restreint de dignitaires (<em>Migan</em>, <em>Mehou</em>) éclairé par la consultation de l’oracle <em>Fa</em>. À son intronisation, il reçoit le <em>Recou</em> (sceptre royal) et choisit ses noms de règne, devises et symboles totémiques.</li>
                  <li><strong className="text-kaolin">Gestion du royaume :</strong> le roi gouverne avec un cabinet ministériel. L’administration s’appuie sur une structure militaire forte, incluant les <em>Agojié</em>, et une économie fondée sur l’agriculture, les taxes marchandes et la diplomatie régionale.</li>
                </ul>
              </div>
            </div>
            <div className="-mx-3 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-3 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {kings.map((king) => (
                <article key={king.id} className="group w-[82vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-gold/20 bg-panel transition duration-300 hover:-translate-y-1 hover:border-gold/55 sm:w-auto">
                  <img src={king.imageUrl} alt={king.imageAlt} className="h-42 w-full object-cover object-[center_22%] transition duration-500 group-hover:scale-105" />
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.13em] text-gold">{king.communeAssociee}</p>
                    <h3 className="font-display mt-2 text-2xl text-white">{king.nom}</h3>
                    <p className="mt-1 min-h-10 text-sm leading-5 text-kaolin/65">{king.sousTitre}</p>
                    <Link href={`/scan/${king.id}`} className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-gold transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Découvrir <ArrowRight aria-hidden="true" size={16} /></Link>
                  </div>
                </article>
              ))}
            </div>
            <Link href="/royaumes" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-3 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Voir tous les rois <ArrowRight aria-hidden="true" size={17} /></Link>
          </section>

          <div className="mt-16">
            <section>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Gamme 03 · Bénin contemporain</p>
              <h2 className="font-display mt-3 text-2xl text-white">Présidents et figures contemporaines</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-kaolin/70">Découvrez les personnalités qui ont marqué la République du Bénin par leurs actions, leurs réformes et leur vision du développement.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {contemporaryFigures.map((figure) => (
                  <article key={figure.id} className="group overflow-hidden rounded-2xl border border-gold/20 bg-panel transition duration-300 hover:-translate-y-1 hover:border-gold/55">
                    <img src={figure.imageUrl} alt={figure.imageAlt} className="h-42 w-full object-cover object-[center_22%] transition duration-500 group-hover:scale-105" />
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.13em] text-gold">Personnalité contemporaine</p>
                      <h3 className="font-display mt-2 text-2xl text-white">{figure.nom}</h3>
                      <p className="mt-1 min-h-10 text-sm leading-5 text-kaolin/65">{figure.sousTitre}</p>
                      <Link href={`/scan/${figure.id}`} className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold text-gold transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Découvrir <ArrowRight aria-hidden="true" size={16} /></Link>
                    </div>
                  </article>
                ))}
              </div>
              <Link href="/contemporain/personnalites" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 px-5 py-3 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Voir plus de présidents et personnalités <ArrowRight aria-hidden="true" size={17} /></Link>
              <section id="temoignages" className="mt-14 rounded-3xl border border-gold/35 bg-[radial-gradient(circle_at_88%_14%,rgba(212,175,55,0.2),transparent_32%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-9" aria-labelledby="temoignages-title">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold"><MessageSquareQuote aria-hidden="true" size={16} /> Avis & témoignages</p>
                <h2 id="temoignages-title" className="font-display mt-3 text-3xl leading-tight text-white sm:text-4xl">Votre voix peut faire grandir Gagnants 229.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-kaolin/75 sm:text-base">Un retour sur votre expérience ou une idée de nouvelle fonctionnalité ? Partagez vos impressions et vos suggestions d&apos;amélioration. Les meilleurs avis et idées seront mis en avant sur la plateforme !</p>
                <PublishedTestimonials />
                <TestimonialForm />
              </section>
              <div className="flex justify-center text-center">
                <VisitorCounter />
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
