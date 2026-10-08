"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, Compass, Landmark, MapPin, MapPinned, Phone, Search, Ticket, UtensilsCrossed, X } from "lucide-react";
import { tourismEvents, type TourismEvent } from "@/data/tourism-events";
import { tourismOutings, type TourismOuting } from "@/data/tourism-outings";
import { tourismSites, type TourismSite } from "@/data/tourism-sites";
import { tourismStays, type TourismStay } from "@/data/tourism-stays";
import { ReturnToExploration } from "@/components/return-to-exploration";

const siteLabels: Record<string, string> = { culture: "Culture & musées", nature: "Nature & parcs", patrimoine: "Histoire & patrimoine", artisanat: "Artisanat & marchés", aventure: "Safari & aventure", histoire: "Histoire & patrimoine", religion: "Sites sacrés", loisirs: "Sorties & découvertes", autre: "Autres lieux", plage: "Plages & lagunes" };
const eventLabels: Record<string, string> = { artistique: "Arts & spectacles", culturel: "Culture", gastronomique: "Gastronomie", musical: "Musique", religieux: "Traditions religieuses", traditionnel: "Traditions" };
const outingLabels: Record<string, string> = { sport_nautique: "Sports nautiques", ferme_eco: "Écotourisme", parc_aventure: "Parc & aventure", ile_lac: "Lac & plage", zoo_safari: "Safari", spa: "Bien-être", autre: "Loisirs" };
const stayLabels: Record<string, string> = { hotel: "Hôtels", auberge: "Auberges", resort: "Resorts", restaurant: "Restaurants", fast_food: "Restauration rapide", cafe_bar: "Cafés & bars" };
const departmentLabels: Record<string, string> = { alibori: "Alibori", atacora: "Atacora", atlantique: "Atlantique", borgou: "Borgou", collines: "Collines", couffo: "Couffo", donga: "Donga", littoral: "Littoral", mono: "Mono", oueme: "Ouémé", plateau: "Plateau", zou: "Zou" };
const sections = [
  { id: "sites", label: "Sites touristiques", icon: Landmark, title: "Les sites à découvrir", description: "Des lieux emblématiques à explorer au Bénin." },
  { id: "festivals", label: "Festivals & événements", icon: CalendarDays, title: "Les rendez-vous culturels", description: "Festivals, fêtes traditionnelles et événements à découvrir." },
  { id: "sorties", label: "Sorties & découvertes", icon: Compass, title: "Des idées pour sortir", description: "Loisirs, nature, sport, bien-être et escapades partout au Bénin." },
  { id: "hotels", label: "Hôtels & restaurants", icon: UtensilsCrossed, title: "Où dormir et se restaurer", description: "Hôtels, restaurants et adresses pour profiter de ton séjour." },
] as const;
type SectionId = (typeof sections)[number]["id"];
type DetailItem = { kind: "site"; item: TourismSite } | { kind: "event"; item: TourismEvent } | { kind: "outing"; item: TourismOuting } | { kind: "stay"; item: TourismStay };
type CatalogueItem = { id: string; kind: DetailItem["kind"]; nom: string; label: string; imageUrl: string | null; location: string; searchText: string; detail: DetailItem; secondary: string | null };
const isSectionId = (value: string | null): value is SectionId => sections.some((section) => section.id === value);
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const formatDateLong = (value: string | null) => { if (!value) return null; const [year, month, day] = value.split("-"); const number = Number(day); return `${number === 1 ? "1er" : number} ${months[Number(month) - 1]} ${year}`; };
const formatEventDate = (event: TourismEvent) => { const start = formatDateLong(event.dateDebut); const end = formatDateLong(event.dateFin); if (!start) return "Date à confirmer"; if (!end || event.dateDebut === event.dateFin) return start; return `Du ${start} au ${end}`; };

export default function TourismePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-earth px-5 py-6 text-kaolin sm:px-8 sm:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mt-5 rounded-3xl border border-gold/25 bg-panel p-8 text-center text-sm text-kaolin/70">
              Chargement du catalogue…
            </div>
          </div>
        </main>
      }
    >
      <TourismePageContent />
    </Suspense>
  );
}

function TourismePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams.get("rubrique");
  const activeSection: SectionId = isSectionId(selected) ? selected : "sites";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<DetailItem | null>(null);
  const active = sections.find((section) => section.id === activeSection)!;
  const ActiveIcon = active.icon;
  const isCatalogue = true;
  const catalogueItems = useMemo<CatalogueItem[]>(() => {
    if (activeSection === "festivals") return tourismEvents.map((item) => ({ id: item.id, kind: "event", nom: item.nom, label: eventLabels[item.categorie] ?? item.categorie, imageUrl: item.imageUrl, location: item.lieu, searchText: `${item.nom} ${item.lieu} ${item.departement}`, detail: { kind: "event", item }, secondary: formatEventDate(item) }));
    if (activeSection === "sorties") return tourismOutings.map((item) => ({ id: item.id, kind: "outing", nom: item.nom, label: outingLabels[item.type] ?? item.type, imageUrl: item.imageUrl, location: item.adresse, searchText: `${item.nom} ${item.adresse} ${item.commune ?? ""} ${item.departement} ${item.activites.join(" ")}`, detail: { kind: "outing", item }, secondary: item.prixEntree }));
    if (activeSection === "hotels") return tourismStays.map((item) => ({ id: item.id, kind: "stay", nom: item.nom, label: stayLabels[item.categorie] ?? item.categorie, imageUrl: item.imageUrl, location: item.adresse ?? `${item.commune ?? ""} ${departmentLabels[item.departement] ?? item.departement}`, searchText: `${item.nom} ${item.adresse ?? ""} ${item.commune ?? ""} ${item.departement} ${item.specialites ?? ""}`, detail: { kind: "stay", item }, secondary: item.prix }));
    return tourismSites.map((item) => ({ id: item.id, kind: "site", nom: item.nom, label: siteLabels[item.categorie] ?? item.categorie, imageUrl: item.imageUrl, location: `${item.commune} · ${departmentLabels[item.departement] ?? item.departement}`, searchText: `${item.nom} ${item.commune} ${item.departement}`, detail: { kind: "site", item }, secondary: null }));
  }, [activeSection]);
  const categories = useMemo(() => ["all", ...Array.from(new Set(catalogueItems.map((item) => item.label)))], [catalogueItems]);
  const visibleItems = useMemo(() => catalogueItems.filter((item) => (category === "all" || item.label === category) && normalize(item.searchText).includes(normalize(query))), [catalogueItems, category, query]);
  const categoryName = activeSection === "sorties" ? "sortie" : activeSection === "festivals" ? "événement" : activeSection === "hotels" ? "adresse" : "site";
  const placeholder = activeSection === "sorties" ? "Rechercher une sortie, une activité, un lieu..." : activeSection === "festivals" ? "Rechercher un festival, un lieu..." : activeSection === "hotels" ? "Rechercher un hôtel, restaurant, une ville..." : "Rechercher un site ou une commune...";
  const changeSection = (section: SectionId) => { const params = new URLSearchParams(searchParams.toString()); if (section === "sites") params.delete("rubrique"); else params.set("rubrique", section); router.push(params.size ? `/tourisme?${params.toString()}` : "/tourisme", { scroll: false }); setCategory("all"); setQuery(""); setSelectedItem(null); };

  return <main className="min-h-screen bg-earth px-5 py-6 text-kaolin sm:px-8 sm:py-8 lg:px-10"><div className="mx-auto w-full max-w-6xl">
    <ReturnToExploration href="/" label="Retour à accueil" />
    <section className="mt-5 overflow-hidden rounded-3xl border border-gold/25 bg-panel shadow-[0_24px_80px_rgba(0,0,0,0.28)]"><div className="px-6 pb-7 pt-8 sm:px-9 sm:pb-9 sm:pt-10"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-gold"><MapPinned aria-hidden="true" size={16} /> Destination Bénin</p><h1 className="font-display mt-3 text-4xl leading-tight text-white sm:text-5xl">Explore le Bénin autrement.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-kaolin/75 sm:text-base">Prépare tes découvertes, retrouve les lieux incontournables et découvre les expériences qui font vivre le pays.</p></div>
      <nav aria-label="Catégories tourisme" className="flex overflow-x-auto border-y border-gold/20 bg-earth/60 px-3 sm:px-5">{sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => changeSection(id)} className={`flex min-h-16 shrink-0 items-center gap-2 border-b-2 px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${activeSection === id ? "border-gold text-gold" : "border-transparent text-kaolin/65 hover:border-gold hover:text-gold"}`}><Icon aria-hidden="true" size={17} />{label}</button>)}</nav>
      <section className="p-6 sm:p-9"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-gold"><ActiveIcon aria-hidden="true" size={17} /> {active.label}</p><h2 className="font-display mt-2 text-3xl text-white">{active.title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-kaolin/70">{active.description}</p></div>
      {isCatalogue ? <><label className="relative mt-7 block"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold" aria-hidden="true" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} className="min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 pl-11 text-sm text-white outline-none placeholder:text-kaolin/45 focus:border-gold" /></label><div className="mt-4 flex gap-2 overflow-x-auto pb-2">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${category === item ? "border-gold bg-gold text-earth" : "border-gold/30 bg-earth/50 text-kaolin/70 hover:border-gold hover:text-gold"}`}>{item === "all" ? `Tous (${catalogueItems.length})` : `${item} (${catalogueItems.filter((catalogueItem) => catalogueItem.label === item).length})`}</button>)}</div><p className="mt-3 text-sm text-kaolin/65">{visibleItems.length} {categoryName}{visibleItems.length > 1 ? "s" : ""} trouvé{visibleItems.length > 1 ? "s" : ""}.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleItems.map((item) => <button type="button" key={item.id} onClick={() => setSelectedItem(item.detail)} className="group overflow-hidden rounded-2xl border border-gold/20 bg-earth/50 text-left transition hover:-translate-y-0.5 hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><div className="relative h-44 bg-panel"><Compass className="absolute inset-0 m-auto text-gold/70" aria-hidden="true" size={38} />{item.imageUrl && <img src={item.imageUrl} alt={item.nom} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} className="relative z-[1] h-full w-full object-cover transition duration-500 group-hover:scale-105" />}<div className="absolute inset-x-0 bottom-0 z-[2] h-24 bg-gradient-to-t from-earth/95 to-transparent" /><span className="absolute bottom-3 left-4 z-[3] text-xs font-bold uppercase tracking-[0.12em] text-gold">{item.label}</span></div><div className="p-4"><h3 className="font-display text-xl text-white">{item.nom}</h3>{item.secondary && <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-gold"><Ticket aria-hidden="true" size={13} /> {item.secondary}</p>}<p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-kaolin/65"><MapPin className="mt-0.5 shrink-0 text-gold" aria-hidden="true" size={13} /> {item.location}</p></div></button>)}</div></> : <div className="mt-8 rounded-2xl border border-gold/20 bg-earth/50 p-8 text-center"><ActiveIcon className="mx-auto text-gold" aria-hidden="true" size={38} /><p className="font-display mt-5 text-2xl text-white">{active.title}</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-kaolin/70">Le contenu de cette rubrique sera ajout\u00e9 ici. Les autres rubriques restent masqu\u00e9es tant que tu ne les choisis pas.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gold">Bient&#244;t disponible <ArrowRight aria-hidden="true" size={16} /></span></div>}</section>
    </section></div>
    {selectedItem && <DetailModal selectedItem={selectedItem} onClose={() => setSelectedItem(null)} />}
  </main>;
}

function DetailModal({ selectedItem, onClose }: { selectedItem: DetailItem; onClose: () => void }) {
  const { kind, item } = selectedItem;
  const label = kind === "event" ? eventLabels[item.categorie] ?? item.categorie : kind === "outing" ? outingLabels[item.type] ?? item.type : kind === "stay" ? stayLabels[item.categorie] ?? item.categorie : siteLabels[item.categorie] ?? item.categorie;
  const location = kind === "outing" ? item.adresse : kind === "event" ? item.lieu : kind === "stay" ? item.adresse ?? `${item.commune ?? ""} · ${departmentLabels[item.departement] ?? item.departement}` : `${item.commune} · ${departmentLabels[item.departement] ?? item.departement}`;
  return <div className="fixed inset-0 z-[70] flex items-end bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="tourism-detail-title"><button type="button" aria-label="Fermer la fenêtre" onClick={onClose} className="absolute inset-0 cursor-default" /><article className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gold/35 bg-panel shadow-2xl"><button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 inline-flex size-10 items-center justify-center rounded-full border border-gold/30 bg-earth/90 text-gold transition hover:bg-gold hover:text-earth" aria-label="Fermer"><X aria-hidden="true" size={19} /></button><div className="relative h-56 bg-earth sm:h-72"><Compass className="absolute inset-0 m-auto text-gold/70" aria-hidden="true" size={42} />{item.imageUrl && <img src={item.imageUrl} alt={item.nom} onError={(event) => { event.currentTarget.style.display = "none"; }} className="relative z-[1] h-full w-full object-cover" />}</div><div className="p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">{label}</p><h2 id="tourism-detail-title" className="font-display mt-3 text-3xl leading-tight text-white">{item.nom}</h2>{kind === "event" ? <EventDetails item={item} /> : kind === "outing" ? <OutingDetails item={item} /> : kind === "stay" ? <StayDetails item={item} /> : <SiteDetails item={item} />}</div></article></div>;
}

function EventDetails({ item }: { item: TourismEvent }) { return <><p className="mt-4 text-sm leading-7 text-kaolin/80">{item.description}</p><dl className="mt-6 grid gap-4 border-t border-gold/20 pt-5 text-sm sm:grid-cols-2"><Info label="Date" value={formatEventDate(item)} /><Info label="Récurrence" value={item.recurrence ?? "À confirmer"} /><Info label="Lieu" value={item.lieu} wide /><Info label="Département" value={departmentLabels[item.departement] ?? item.departement} /></dl></>; }
function OutingDetails({ item }: { item: TourismOuting }) { return <><p className="mt-4 text-sm leading-7 text-kaolin/80">{item.description}</p><div className="mt-5 flex flex-wrap gap-2">{item.activites.map((activity) => <span key={activity} className="rounded-full border border-gold/30 bg-earth/70 px-3 py-1.5 text-xs font-bold text-kaolin/80">{activity}</span>)}</div><dl className="mt-6 grid gap-4 border-t border-gold/20 pt-5 text-sm sm:grid-cols-2"><Info label="Adresse" value={item.adresse} wide /><Info label="Tarif" value={item.prixEntree ?? "À confirmer"} /><Info label="Département" value={departmentLabels[item.departement] ?? item.departement} />{item.horaires && <Info label="Horaires" value={item.horaires} />}{item.telephone && <Info label="Contact" value={item.telephone} />}</dl></>; }
function StayDetails({ item }: { item: TourismStay }) { return <><p className="mt-4 text-sm leading-7 text-kaolin/80">{item.description}</p><dl className="mt-6 grid gap-4 border-t border-gold/20 pt-5 text-sm sm:grid-cols-2"><Info label="Adresse" value={item.adresse} wide />{item.prix && <Info label="Tarif" value={item.prix} />}{item.etoiles && <Info label="Étoiles" value={`${item.etoiles} étoiles`} />}{item.specialites && <Info label="Spécialités" value={item.specialites} wide />}{item.horaires && <Info label="Horaires" value={item.horaires} />}{item.telephone && <Info label="Contact" value={item.telephone} />}<Info label="Département" value={departmentLabels[item.departement] ?? item.departement} /></dl></>; }
function SiteDetails({ item }: { item: TourismSite }) { return <><p className="mt-4 text-sm leading-7 text-kaolin/80">Retrouve ce lieu emblématique et prépare ta prochaine découverte au Bénin.</p><dl className="mt-6 grid gap-4 border-t border-gold/20 pt-5 text-sm sm:grid-cols-2"><Info label="Commune" value={item.commune} /><Info label="Département" value={departmentLabels[item.departement] ?? item.departement} /></dl></>; }
function Info({ label, value, wide = false }: { label: string; value: string | null; wide?: boolean }) { const Icon = label === "Contact" ? Phone : label === "Horaires" ? Clock3 : label === "Tarif" ? Ticket : MapPin; return <div className={wide ? "sm:col-span-2" : ""}><dt className="flex items-center gap-1.5 font-bold text-gold"><Icon aria-hidden="true" size={14} />{label}</dt><dd className="mt-1 text-kaolin/75">{value ?? "À confirmer"}</dd></div>; }
