"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  establishmentEquipment,
  emptyEstablishmentDetails,
  establishmentTypes,
  type Establishment,
  type EstablishmentDetails,
  type EstablishmentType,
} from "@/lib/establishments";

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type SelectedPhoto = { id: string; file: File };

const apartmentEnergyOptions = ["Groupe électrogène", "Panneaux solaires", "Bâche à eau"];
const apartmentAmenities = [
  "Wi-Fi haut débit",
  "Canal+ / Netflix",
  "Machine à laver",
  "Cuisine équipée",
  "Garage fermé / sécurisé",
  "Gardien 24h/24 et 7j/7",
];
const restaurantCuisines = [
  "Spécialités locales béninoises",
  "Cuisine africaine",
  "Cuisine européenne / gastronomique",
  "Fast-food / grillades",
  "Bistro / lounge",
];
const restaurantServices = ["Sur place", "À emporter", "Livraison à domicile", "Réservation de table", "Traiteur / événements"];
const restaurantAmbiance = ["Climatisé", "Espace VIP", "Terrasse / plein air", "Musique live / DJ", "Écran géant (matchs)"];
const hotelServices = ["Room service", "Réception 24h/24", "Navette aéroport", "Blanchisserie"];
const hotelFacilities = ["Piscine", "Salle de sport", "Bar / restaurant", "Parking sécurisé"];

const inputClassName = "mt-2 min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 text-white outline-none focus:border-gold";
const checkboxClassName = "size-4 accent-[#d4af37]";

function PhotoPreview({ file, alt, className }: { file: File; alt: string; className: string }) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    const previewUrl = URL.createObjectURL(file);
    image.src = previewUrl;
    return () => {
      image.removeAttribute("src");
      URL.revokeObjectURL(previewUrl);
    };
  }, [file]);

  return <img alt={alt} className={className} ref={imageRef} />;
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
}) {
  return <label className="block text-sm font-semibold text-kaolin">
    {label}
    <input
      className={inputClassName}
      max={max}
      min={min}
      onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
      step="1"
      type="number"
      value={value ?? ""}
    />
  </label>;
}

function CheckboxGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
}) {
  return <fieldset>
    <legend className="text-sm font-semibold text-kaolin">{legend}</legend>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {options.map((option) => <label className="flex items-center gap-3 rounded-lg border border-gold/15 bg-earth/60 p-3 text-sm text-kaolin/80" key={option}>
        <input checked={selected.includes(option)} className={checkboxClassName} onChange={() => onToggle(option)} type="checkbox" />
        {option}
      </label>)}
    </div>
  </fieldset>;
}

export function EstablishmentForm() {
  const [record, setRecord] = useState<Establishment | null>(null);
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState<EstablishmentType>("hotel");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [details, setDetails] = useState<EstablishmentDetails>(emptyEstablishmentDetails);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [primaryPhotoId, setPrimaryPhotoId] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadEstablishment() {
      try {
        const response = await fetch("/api/establishments", { cache: "no-store" });
        const result = await response.json() as { record?: Establishment | null; photoUrls?: string[]; error?: string };
        if (!response.ok) throw new Error(result.error ?? "Impossible de charger la fiche.");
        if (active && result.record) {
          const current = result.record;
          if (!active) return;
          setRecord(current);
          setPhotoUrls(result.photoUrls ?? []);
          setName(current.name);
          setBusinessType(current.business_type);
          setPhone(current.phone);
          setAddress(current.address);
          setDescription(current.description);
          setEquipment(current.equipment);
          setDetails({
            apartment: { ...emptyEstablishmentDetails.apartment, ...current.details?.apartment },
            restaurant: { ...emptyEstablishmentDetails.restaurant, ...current.details?.restaurant },
            hotel: { ...emptyEstablishmentDetails.hotel, ...current.details?.hotel },
          });
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Impossible de charger la fiche.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadEstablishment();
    return () => { active = false; };
  }, []);

  function selectPhotos(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    const currentCount = (record?.photos.length ?? 0) + photos.length;
    if (currentCount + selected.length > MAX_PHOTOS) {
      setError(`Tu peux enregistrer ${MAX_PHOTOS} photos au maximum.`);
      return;
    }
    const invalid = selected.find((file) => !ACCEPTED_IMAGE_TYPES.has(file.type) || file.size > MAX_PHOTO_BYTES);
    if (invalid) {
      setError("Chaque photo doit être au format JPG, PNG ou WebP et ne pas dépasser 5 Mo.");
      return;
    }
    setError(null);
    const addedPhotos = selected.map((file) => ({ id: crypto.randomUUID(), file }));
    setPhotos((current) => [...current, ...addedPhotos]);
    if (currentCount === 0 && !primaryPhotoId) setPrimaryPhotoId(addedPhotos[0]?.id ?? null);
  }

  function removeSelectedPhoto(photoId: string) {
    const remainingPhotos = photos.filter(({ id }) => id !== photoId);
    setPhotos(remainingPhotos);
    if (primaryPhotoId === photoId) setPrimaryPhotoId(remainingPhotos[0]?.id ?? null);
  }

  function toggleEquipment(item: string) {
    setEquipment((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  function toggleDetailOption<K extends keyof EstablishmentDetails>(
    category: K,
    field: keyof EstablishmentDetails[K],
    option: string,
  ) {
    setDetails((current) => {
      const value = current[category][field];
      if (!Array.isArray(value)) return current;
      const nextValue = value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option];
      return {
        ...current,
        [category]: { ...current[category], [field]: nextValue },
      };
    });
  }

  async function saveEstablishment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (record?.status === "approved") return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const orderedPhotos = primaryPhotoId
        ? [...photos].sort((first, second) => Number(second.id === primaryPhotoId) - Number(first.id === primaryPhotoId))
        : photos;
      const formData = new FormData();
      formData.set("businessType", businessType);
      formData.set("name", name.trim());
      formData.set("phone", phone.trim());
      formData.set("address", address.trim());
      formData.set("description", description.trim());
      formData.set("equipment", JSON.stringify(equipment));
      formData.set("details", JSON.stringify(details));
      formData.set("retainedPhotos", JSON.stringify(record?.photos ?? []));
      formData.set("primaryNewPhoto", String(Boolean(primaryPhotoId)));
      for (const { file } of orderedPhotos) formData.append("photos", file);

      const response = await fetch("/api/establishments", { method: "POST", body: formData });
      const result = await response.json() as { record?: Establishment; photoUrls?: string[]; error?: string };
      if (!response.ok || !result.record) throw new Error(result.error ?? "Impossible d’enregistrer la fiche.");

      setRecord(result.record);
      setPhotoUrls(result.photoUrls ?? []);
      setPhotos([]);
      setPrimaryPhotoId(null);
      setNotice("Ta fiche est enregistrée et envoyée à l’équipe pour validation.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d’enregistrer la fiche.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="mt-6 text-sm text-kaolin/70">Chargement de ta fiche…</p>;
  if (record?.status === "approved") {
    return <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
      <p className="font-bold text-emerald-200">Établissement approuvé et publié</p>
      <p className="mt-2 text-sm text-kaolin/75">{record.name} est visible dans la rubrique {establishmentTypes[record.business_type].plural}. Pour modifier la fiche, contacte l’équipe.</p>
    </div>;
  }

  return <form className="mt-6 space-y-5" onSubmit={saveEstablishment}>
    {record?.status === "rejected"
      ? <div className="rounded-xl border border-red-400/30 bg-red-950/20 p-4 text-sm text-red-100">
          <p className="font-bold">Votre fiche nécessite des corrections avant publication.</p>
          {record.rejection_reason && <p className="mt-2 leading-6"><span className="font-semibold">Motif communiqué par l’équipe :</span> {record.rejection_reason}</p>}
          <p className="mt-2 text-red-100/75">Modifiez les informations demandées puis soumettez à nouveau votre fiche pour validation.</p>
        </div>
      : record && <p className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-gold">Statut : en attente de validation. Vous pouvez encore modifier votre fiche.</p>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-semibold text-kaolin">
        Nom commercial de l’établissement
        <input className="mt-2 min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 text-white outline-none focus:border-gold" maxLength={120} onChange={(event) => setName(event.target.value)} placeholder="Ex. Hôtel Bénin Marina" required value={name} />
        <span className="mt-1 block text-xs font-normal text-kaolin/55">Indiquez le nom de votre établissement, et non votre nom personnel.</span>
      </label>
      <label className="block text-sm font-semibold text-kaolin">
        Type d’établissement
        <select className="mt-2 min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 text-white outline-none focus:border-gold" onChange={(event) => setBusinessType(event.target.value as EstablishmentType)} value={businessType}>
          {Object.entries(establishmentTypes).map(([value, type]) => <option key={value} value={value}>{type.label}</option>)}
        </select>
      </label>
    </div>
    <label className="block text-sm font-semibold text-kaolin">
      Téléphone
      <input autoComplete="tel" className="mt-2 min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 text-white outline-none focus:border-gold" maxLength={40} onChange={(event) => setPhone(event.target.value)} required value={phone} />
    </label>
    <label className="block text-sm font-semibold text-kaolin">
      Adresse / quartier
      <input autoComplete="street-address" className="mt-2 min-h-12 w-full rounded-xl border border-gold/30 bg-earth px-4 text-white outline-none focus:border-gold" maxLength={200} onChange={(event) => setAddress(event.target.value)} required value={address} />
    </label>
    <label className="block text-sm font-semibold text-kaolin">
      Description
      <textarea className="mt-2 min-h-32 w-full rounded-xl border border-gold/30 bg-earth px-4 py-3 text-white outline-none focus:border-gold" maxLength={3000} onChange={(event) => setDescription(event.target.value)} required value={description} />
    </label>
    <fieldset>
      <legend className="text-sm font-semibold text-kaolin">Équipements et services</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {establishmentEquipment.map((item) => <label className="flex items-center gap-3 rounded-lg border border-gold/15 bg-earth/60 p-3 text-sm text-kaolin/80" key={item}>
          <input checked={equipment.includes(item)} className="size-4 accent-[#d4af37]" onChange={() => toggleEquipment(item)} type="checkbox" />
          {item}
        </label>)}
      </div>
    </fieldset>
    {businessType === "apartment" && <section aria-labelledby="apartment-details-heading" className="space-y-5 rounded-2xl border border-gold/20 bg-earth/30 p-5">
      <div>
        <h3 className="font-display text-xl text-white" id="apartment-details-heading">Tarifs et confort</h3>
        <p className="mt-1 text-sm text-kaolin/65">Précisez les tarifs et équipements de votre appartement ou meublé.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="Tarif passage / pause (3 h), en FCFA" value={details.apartment.passagePrice} onChange={(value) => setDetails((current) => ({ ...current, apartment: { ...current.apartment, passagePrice: value } }))} />
        <NumberField label="Tarif nuitée, en FCFA" value={details.apartment.nightPrice} onChange={(value) => setDetails((current) => ({ ...current, apartment: { ...current.apartment, nightPrice: value } }))} />
        <NumberField label="Tarif journée (24 h), en FCFA" value={details.apartment.dayPrice} onChange={(value) => setDetails((current) => ({ ...current, apartment: { ...current.apartment, dayPrice: value } }))} />
        <NumberField label="Remise séjour long, en %" max={100} value={details.apartment.longStayDiscount} onChange={(value) => setDetails((current) => ({ ...current, apartment: { ...current.apartment, longStayDiscount: value } }))} />
        <NumberField label="Nombre maximum d’adultes" min={1} value={details.apartment.maxAdults} onChange={(value) => setDetails((current) => ({ ...current, apartment: { ...current.apartment, maxAdults: value } }))} />
        <NumberField label="Nombre de chambres" min={0} value={details.apartment.bedrooms} onChange={(value) => setDetails((current) => ({ ...current, apartment: { ...current.apartment, bedrooms: value } }))} />
      </div>
      <CheckboxGroup legend="Autonomie énergétique et en eau" options={apartmentEnergyOptions} selected={details.apartment.energyOptions} onToggle={(option) => toggleDetailOption("apartment", "energyOptions", option)} />
      <CheckboxGroup legend="Équipements et sécurité" options={apartmentAmenities} selected={details.apartment.amenities} onToggle={(option) => toggleDetailOption("apartment", "amenities", option)} />
      <label className="block text-sm font-semibold text-kaolin">
        Point de repère à proximité
        <input className={inputClassName} maxLength={160} onChange={(event) => setDetails((current) => ({ ...current, apartment: { ...current.apartment, landmark: event.target.value } }))} placeholder="Ex. à 5 min de l’aéroport" value={details.apartment.landmark} />
      </label>
    </section>}
    {businessType === "restaurant" && <section aria-labelledby="restaurant-details-heading" className="space-y-5 rounded-2xl border border-gold/20 bg-earth/30 p-5">
      <div>
        <h3 className="font-display text-xl text-white" id="restaurant-details-heading">Cuisine et expérience</h3>
        <p className="mt-1 text-sm text-kaolin/65">Mettez en avant vos spécialités, vos services et votre ambiance.</p>
      </div>
      <CheckboxGroup legend="Type de cuisine" options={restaurantCuisines} selected={details.restaurant.cuisines} onToggle={(option) => toggleDetailOption("restaurant", "cuisines", option)} />
      <label className="block text-sm font-semibold text-kaolin">
        Plats phares
        <textarea className="mt-2 min-h-24 w-full rounded-xl border border-gold/30 bg-earth px-4 py-3 text-white outline-none focus:border-gold" maxLength={500} onChange={(event) => setDetails((current) => ({ ...current, restaurant: { ...current.restaurant, signatureDishes: event.target.value } }))} placeholder="Ex. piron noir au mouton, poisson braisé…" value={details.restaurant.signatureDishes} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="Prix moyen d’un plat principal, en FCFA" value={details.restaurant.averageMainPrice} onChange={(value) => setDetails((current) => ({ ...current, restaurant: { ...current.restaurant, averageMainPrice: value } }))} />
        <label className="block text-sm font-semibold text-kaolin">
          Horaires de service
          <input className={inputClassName} maxLength={100} onChange={(event) => setDetails((current) => ({ ...current, restaurant: { ...current.restaurant, openingHours: event.target.value } }))} placeholder="Ex. 11 h – 23 h" value={details.restaurant.openingHours} />
        </label>
      </div>
      <CheckboxGroup legend="Services disponibles" options={restaurantServices} selected={details.restaurant.services} onToggle={(option) => toggleDetailOption("restaurant", "services", option)} />
      <CheckboxGroup legend="Cadre et ambiance" options={restaurantAmbiance} selected={details.restaurant.ambiance} onToggle={(option) => toggleDetailOption("restaurant", "ambiance", option)} />
      <label className="block text-sm font-semibold text-kaolin">
        Jours de fermeture
        <input className={inputClassName} maxLength={100} onChange={(event) => setDetails((current) => ({ ...current, restaurant: { ...current.restaurant, closedDays: event.target.value } }))} placeholder="Ex. fermé le lundi" value={details.restaurant.closedDays} />
      </label>
    </section>}
    {businessType === "hotel" && <section aria-labelledby="hotel-details-heading" className="space-y-5 rounded-2xl border border-gold/20 bg-earth/30 p-5">
      <div>
        <h3 className="font-display text-xl text-white" id="hotel-details-heading">Hébergement et services hôteliers</h3>
        <p className="mt-1 text-sm text-kaolin/65">Présentez les tarifs de vos chambres et les services de votre établissement.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="Tarif chambre standard, en FCFA / nuit" value={details.hotel.standardRoomPrice} onChange={(value) => setDetails((current) => ({ ...current, hotel: { ...current.hotel, standardRoomPrice: value } }))} />
        <NumberField label="Tarif suite VIP, en FCFA / nuit" value={details.hotel.vipSuitePrice} onChange={(value) => setDetails((current) => ({ ...current, hotel: { ...current.hotel, vipSuitePrice: value } }))} />
        <label className="block text-sm font-semibold text-kaolin">
          Petit-déjeuner
          <select className={inputClassName} onChange={(event) => setDetails((current) => ({ ...current, hotel: { ...current.hotel, breakfast: event.target.value } }))} value={details.hotel.breakfast}>
            <option value="">À préciser</option>
            <option value="included">Inclus dans la nuitée</option>
            <option value="extra">En supplément</option>
            <option value="unavailable">Non disponible</option>
          </select>
        </label>
        <NumberField label="Capacité de la salle de réunion (personnes)" value={details.hotel.meetingRoomCapacity} onChange={(value) => setDetails((current) => ({ ...current, hotel: { ...current.hotel, meetingRoomCapacity: value } }))} />
      </div>
      <CheckboxGroup legend="Services hôteliers" options={hotelServices} selected={details.hotel.services} onToggle={(option) => toggleDetailOption("hotel", "services", option)} />
      <CheckboxGroup legend="Infrastructures" options={hotelFacilities} selected={details.hotel.facilities} onToggle={(option) => toggleDetailOption("hotel", "facilities", option)} />
    </section>}
    <div>
      <label className="block text-sm font-semibold text-kaolin" htmlFor="establishment-photos">Photos professionnelles</label>
      <p className="mt-1 text-xs text-kaolin/55">JPG, PNG ou WebP · 5 Mo maximum par photo · 6 photos maximum.</p>
      {photoUrls.length > 0 && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photoUrls.map((url, index) => <div className="relative" key={url}>
          <img alt={index === 0 ? "Photo principale enregistrée" : "Photo déjà enregistrée"} className="h-28 w-full rounded-xl object-cover" src={url} />
          {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-1 text-xs font-bold text-earth">Photo principale</span>}
        </div>)}
      </div>}
      <input accept="image/jpeg,image/png,image/webp" className="mt-3 block w-full text-sm text-kaolin/75 file:mr-4 file:rounded-lg file:border-0 file:bg-gold file:px-4 file:py-2 file:font-bold file:text-earth" id="establishment-photos" multiple onChange={(event) => { selectPhotos(event.target.files); event.target.value = ""; }} type="file" />
      {photos.length > 0 && <p className="mt-2 text-xs text-kaolin/60">{photos.length} nouvelle(s) photo(s) sélectionnée(s).</p>}
      {photos.length > 0 && <div aria-label="Photos sélectionnées" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map(({ id, file }, index) => <article className="overflow-hidden rounded-xl border border-gold/20 bg-earth/70" key={id}>
          <div className="relative">
            <PhotoPreview alt={`Aperçu de la photo ${index + 1}`} className="h-32 w-full object-cover" file={file} />
            {primaryPhotoId === id && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-1 text-xs font-bold text-earth">Photo principale</span>}
          </div>
          <div className="flex flex-wrap gap-2 p-2">
            <button aria-pressed={primaryPhotoId === id} className={`min-h-9 rounded-lg border px-3 text-xs font-semibold ${primaryPhotoId === id ? "border-gold bg-gold/10 text-gold" : "border-gold/30 text-kaolin hover:border-gold hover:text-gold"}`} onClick={() => setPrimaryPhotoId(id)} type="button">
              {primaryPhotoId === id ? "Photo principale" : "Définir comme principale"}
            </button>
            <button aria-label={`Supprimer la photo ${index + 1}`} className="min-h-9 rounded-lg border border-red-400/30 px-3 text-xs font-semibold text-red-200 hover:border-red-300" onClick={() => removeSelectedPhoto(id)} type="button">Supprimer</button>
          </div>
        </article>)}
      </div>}
    </div>
    {error && <p aria-live="polite" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
    {notice && <p aria-live="polite" className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-100">{notice}</p>}
    <button className="min-h-12 rounded-xl bg-gold px-6 py-3 text-sm font-extrabold text-earth disabled:cursor-not-allowed disabled:opacity-60" disabled={saving} type="submit">
      {saving ? "Enregistrement…" : record ? "Enregistrer les modifications" : "Envoyer pour validation"}
    </button>
  </form>;
}
