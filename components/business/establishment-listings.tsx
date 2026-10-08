"use client";

import Link from "next/link";
import { Building2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  establishmentTypes,
  type Establishment,
  type EstablishmentDetails,
  type EstablishmentType,
} from "@/lib/establishments";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = { businessType?: EstablishmentType; limit?: number };

export function EstablishmentListings({ businessType, limit }: Props) {
  const [items, setItems] = useState<Establishment[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadListings() {
      try {
        const supabase = createSupabaseBrowserClient();
        let query = supabase.from("establishments").select("*").eq("status", "approved").order("created_at", { ascending: false });
        if (businessType) query = query.eq("business_type", businessType);
        if (limit) query = query.limit(limit);
        const { data, error: queryError } = await query;
        if (queryError) throw queryError;
        const establishments = (data ?? []) as Establishment[];
        const photoResults = await Promise.all(establishments.map(async (item) => {
          const signedPhotos = await Promise.all(item.photos.map(async (path) => {
            const { data: signedPhoto, error: photoError } = await supabase.storage
              .from("establishment-photos")
              .createSignedUrl(path, 3600);
            if (photoError) throw photoError;
            return signedPhoto.signedUrl;
          }));
          return [item.id, signedPhotos] as const;
        }));
        if (active) {
          setItems(establishments);
          setImageUrls(Object.fromEntries(photoResults));
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Impossible de charger les établissements.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadListings();
    return () => { active = false; };
  }, [businessType, limit]);

  if (loading) return <p className="mt-6 text-sm text-kaolin/65">Chargement des établissements…</p>;
  if (error) return <p aria-live="polite" className="mt-6 rounded-xl border border-red-400/30 bg-red-950/20 p-4 text-sm text-red-200">{error}</p>;

  return <>
    {items.length === 0 ? (
      <div className="mt-6 rounded-2xl border border-gold/20 bg-earth/50 px-6 py-10 text-center sm:px-10">
        <Building2 aria-hidden="true" className="mx-auto text-gold/80" size={32} strokeWidth={1.6} />
        <h3 className="font-display mt-4 text-xl text-white">Aucun établissement répertorié pour l’instant</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-kaolin/70">
          Vous gérez un hôtel, un restaurant ou un appartement au Bénin ? Référencez votre établissement sur Gagnants 229.
        </p>
        <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-gold px-5 py-2.5 text-sm font-extrabold text-earth transition hover:brightness-110" href="/register">
          Inscrire mon établissement
        </Link>
      </div>
    ) : (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => <EstablishmentCard imageUrls={imageUrls[item.id]} item={item} key={item.id} />)}
      </div>
    )}
  </>;
}

function EstablishmentCard({ item, imageUrls }: { item: Establishment; imageUrls?: string[] }) {
  const [dialog, setDialog] = useState<{ type: "details" } | { type: "photo"; index: number } | null>(null);
  const photos = imageUrls ?? [];

  useEffect(() => {
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialog(null);
      if (dialog.type === "photo" && event.key === "ArrowRight") {
        setDialog({ type: "photo", index: (dialog.index + 1) % photos.length });
      }
      if (dialog.type === "photo" && event.key === "ArrowLeft") {
        setDialog({ type: "photo", index: (dialog.index - 1 + photos.length) % photos.length });
      }
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [dialog, photos.length]);

  return <>
    <article className="overflow-hidden rounded-2xl border border-gold/20 bg-earth/60">
      <div className="relative h-48 bg-panel">
        {photos[0] ? <button aria-label={`Agrandir la photo principale de ${item.name}`} className="size-full cursor-zoom-in" onClick={() => setDialog({ type: "photo", index: 0 })} type="button">
          <img alt={`Photo principale de ${item.name}`} className="size-full object-cover" loading="lazy" src={photos[0]} />
        </button> : <div className="grid size-full place-items-center text-sm text-kaolin/45">{establishmentTypes[item.business_type].label}</div>}
      </div>
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold">{establishmentTypes[item.business_type].label}</p>
        <h3 className="font-display mt-1 text-xl text-white">{item.name}</h3>
        <p className="mt-2 text-sm text-gold">{item.address}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-kaolin/70">{item.description}</p>
        {item.equipment.length > 0 && <p className="mt-3 text-xs leading-5 text-kaolin/55">{item.equipment.join(" · ")}</p>}
        {photos.length > 1 && <div aria-label={`Galerie photos de ${item.name}`} className="mt-3 grid grid-cols-4 gap-2">
          {photos.slice(1).map((url, index) => <button aria-label={`Agrandir la photo ${index + 2} de ${item.name}`} className="h-16 overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" key={url} onClick={() => setDialog({ type: "photo", index: index + 1 })} type="button">
            <img alt="" className="size-full object-cover transition hover:scale-105" loading="lazy" src={url} />
          </button>)}
        </div>}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button className="text-sm font-bold text-gold underline-offset-4 hover:underline" onClick={() => setDialog({ type: "details" })} type="button">Voir les détails</button>
          <a className="text-sm font-bold text-gold underline-offset-4 hover:underline" href={`tel:${item.phone}`}>Appeler : {item.phone}</a>
        </div>
      </div>
    </article>
    {dialog && <div
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/85 p-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-6"
      onClick={() => setDialog(null)}
      role="presentation"
    >
      <section
        aria-label={dialog.type === "details" ? `Détails de ${item.name}` : `Photo de ${item.name}`}
        aria-modal="true"
        className={`relative flex max-h-[calc(100dvh-1rem)] w-full flex-col overflow-hidden rounded-2xl border border-gold/30 bg-panel shadow-2xl sm:max-h-[calc(100dvh-3rem)] ${dialog.type === "photo" ? "max-w-5xl" : "max-w-2xl"}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        {dialog.type === "details" ? <>
          <div className="sticky top-0 z-10 flex shrink-0 justify-end border-b border-gold/15 bg-panel/95 p-2 backdrop-blur">
            <button aria-label="Fermer les détails" className="grid size-11 place-items-center rounded-full border border-white/20 bg-earth text-white hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" onClick={() => setDialog(null)} type="button">
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain p-5 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-gold">{establishmentTypes[item.business_type].label}</p>
            <h2 className="font-display mt-2 pr-2 text-3xl text-white">{item.name}</h2>
            <p className="mt-2 text-sm text-gold">{item.address}</p>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-kaolin/80">{item.description}</p>
            {photos.length > 0 && <section aria-label={`Photos de ${item.name}`} className="mt-6">
              <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gold">Photos de l’établissement</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((url, index) => <button
                  aria-label={`Afficher en grand la photo ${index + 1} de ${item.name}`}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  key={url}
                  onClick={() => setDialog({ type: "photo", index })}
                  type="button"
                >
                  <img alt={`Photo ${index + 1} de ${item.name}`} className="size-full object-cover transition duration-200 group-hover:scale-105" loading="lazy" src={url} />
                  <span className="absolute inset-x-0 bottom-0 bg-earth/75 px-2 py-1 text-left text-xs text-white">Agrandir</span>
                </button>)}
              </div>
            </section>}
            <EstablishmentDetailsContent businessType={item.business_type} details={item.details} equipment={item.equipment} />
            <a className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth" href={`tel:${item.phone}`}>Appeler : {item.phone}</a>
          </div>
        </> : <>
          <div className="flex shrink-0 justify-end p-2">
            <button aria-label="Fermer la photo" className="grid size-11 place-items-center rounded-full border border-white/20 bg-earth text-white hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" onClick={() => setDialog(null)} type="button">
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <div className="relative grid min-h-0 flex-1 place-items-center px-2 pb-2 sm:px-4">
            <img alt={`Photo ${dialog.index + 1} de ${item.name}`} className="max-h-[calc(100dvh-7rem)] w-full object-contain sm:max-h-[calc(100dvh-9rem)]" src={photos[dialog.index]} />
            {photos.length > 1 && <>
              <button aria-label="Photo précédente" className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-earth/90 text-white hover:text-gold" onClick={() => setDialog({ type: "photo", index: (dialog.index - 1 + photos.length) % photos.length })} type="button"><ChevronLeft aria-hidden="true" /></button>
              <button aria-label="Photo suivante" className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-earth/90 text-white hover:text-gold" onClick={() => setDialog({ type: "photo", index: (dialog.index + 1) % photos.length })} type="button"><ChevronRight aria-hidden="true" /></button>
            </>}
          </div>
          {photos.length > 1 && <p className="shrink-0 py-2 text-center text-sm text-kaolin/70">{dialog.index + 1} / {photos.length}</p>}
        </>}
      </section>
    </div>}
  </>;
}

function formatPrice(value: number | null | undefined) {
  return value == null ? null : `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}

function DetailsGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-6">
    <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-gold">{title}</h3>
    <dl className="mt-3 grid gap-x-5 gap-y-3 sm:grid-cols-2">{children}</dl>
  </section>;
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return <div>
    <dt className="text-xs font-semibold text-kaolin/55">{label}</dt>
    <dd className="mt-1 whitespace-pre-wrap text-sm text-kaolin/85">{value}</dd>
  </div>;
}

function EstablishmentDetailsContent({
  businessType,
  details,
  equipment,
}: {
  businessType: EstablishmentType;
  details: EstablishmentDetails;
  equipment: string[];
}) {
  const equipmentDetails = equipment.length > 0 && <DetailsGroup title="Équipements complémentaires">
    <Detail label="Équipements" value={equipment.join(" · ")} />
  </DetailsGroup>;

  if (businessType === "apartment") {
    const categoryDetails = details.apartment;
    return <>
      <DetailsGroup title="Tarifs et confort">
        <Detail label="Passage / pause (3 h)" value={formatPrice(categoryDetails.passagePrice)} />
        <Detail label="Nuitée" value={formatPrice(categoryDetails.nightPrice)} />
        <Detail label="Journée (24 h)" value={formatPrice(categoryDetails.dayPrice)} />
        <Detail label="Remise séjour long" value={categoryDetails.longStayDiscount == null ? null : `${categoryDetails.longStayDiscount} %`} />
        <Detail label="Capacité maximale" value={categoryDetails.maxAdults == null ? null : `${categoryDetails.maxAdults} adulte(s)`} />
        <Detail label="Chambres" value={categoryDetails.bedrooms == null ? null : String(categoryDetails.bedrooms)} />
        <Detail label="Autonomie énergétique et en eau" value={categoryDetails.energyOptions?.join(" · ")} />
        <Detail label="Équipements et sécurité" value={categoryDetails.amenities?.join(" · ")} />
        <Detail label="Point de repère" value={categoryDetails.landmark} />
      </DetailsGroup>
      {equipmentDetails}
    </>;
  }

  if (businessType === "restaurant") {
    const categoryDetails = details.restaurant;
    return <>
      <DetailsGroup title="Cuisine et expérience">
        <Detail label="Types de cuisine" value={categoryDetails.cuisines?.join(" · ")} />
        <Detail label="Plats phares" value={categoryDetails.signatureDishes} />
        <Detail label="Prix moyen d’un plat" value={formatPrice(categoryDetails.averageMainPrice)} />
        <Detail label="Services" value={categoryDetails.services?.join(" · ")} />
        <Detail label="Cadre et ambiance" value={categoryDetails.ambiance?.join(" · ")} />
        <Detail label="Horaires" value={categoryDetails.openingHours} />
        <Detail label="Jours de fermeture" value={categoryDetails.closedDays} />
      </DetailsGroup>
      {equipmentDetails}
    </>;
  }

  const categoryDetails = details.hotel;
  return <>
    <DetailsGroup title="Hébergement et services">
      <Detail label="Chambre standard / nuit" value={formatPrice(categoryDetails.standardRoomPrice)} />
      <Detail label="Suite VIP / nuit" value={formatPrice(categoryDetails.vipSuitePrice)} />
      <Detail label="Petit-déjeuner" value={{ included: "Inclus dans la nuitée", extra: "En supplément", unavailable: "Non disponible" }[categoryDetails.breakfast] ?? null} />
      <Detail label="Services hôteliers" value={categoryDetails.services?.join(" · ")} />
      <Detail label="Capacité de la salle de réunion" value={categoryDetails.meetingRoomCapacity == null ? null : `${categoryDetails.meetingRoomCapacity} personne(s)`} />
      <Detail label="Infrastructures" value={categoryDetails.facilities?.join(" · ")} />
    </DetailsGroup>
    {equipmentDetails}
  </>;
}

export function EstablishmentCategoryLinks({ selected }: { selected?: EstablishmentType | "all" }) {
  const categories = [
    { href: "/etablissements", label: "Tous", value: undefined },
    { href: "/hotels", label: "Hôtels", value: "hotel" as const },
    { href: "/restaurants", label: "Restaurants", value: "restaurant" as const },
    { href: "/appartements", label: "Appartements", value: "apartment" as const },
  ];

  return <nav aria-label="Filtrer les établissements" className="mt-6 flex flex-wrap gap-2">
    {categories.map((category) => <Link
      aria-current={(category.value ? selected === category.value : selected === "all") ? "page" : undefined}
      className={`inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-bold transition ${(category.value ? selected === category.value : selected === "all") ? "border-gold bg-gold text-earth" : "border-gold/30 bg-earth/50 text-kaolin/75 hover:border-gold hover:text-gold"}`}
      href={category.href}
      key={category.href}
    >
      {category.label}
    </Link>)}
  </nav>;
}

export function EstablishmentListingPage({ businessType }: { businessType?: EstablishmentType }) {
  const heading = businessType ? establishmentTypes[businessType].plural : "Tous les établissements";
  return <main className="min-h-[70vh] bg-earth px-5 py-10 text-kaolin sm:px-8 lg:px-10">
    <section className="mx-auto w-full max-w-6xl rounded-3xl border border-gold/25 bg-panel p-6 sm:p-9">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Découvrir le Bénin</p>
      <h1 className="font-display mt-2 text-4xl text-white">{heading}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-kaolin/70">Les établissements apparaissent ici après vérification et validation par notre équipe.</p>
      <EstablishmentCategoryLinks selected={businessType ?? "all"} />
      <EstablishmentListings businessType={businessType} />
    </section>
  </main>;
}
