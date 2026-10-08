"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { establishmentTypes, type Establishment, type EstablishmentStatus, type EstablishmentType } from "@/lib/establishments";

type StatusFilter = "all" | EstablishmentStatus;
const PAGE_SIZE = 8;

function formatDetailKey(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (character) => character.toUpperCase());
}

function formatDetailValue(key: string, value: unknown) {
  if (Array.isArray(value)) return value.length ? value.join(" · ") : "Non renseigné";
  if (value === null || value === undefined || value === "") return "Non renseigné";
  if (typeof value === "number") {
    const formatted = new Intl.NumberFormat("fr-FR").format(value);
    if (["passagePrice", "nightPrice", "dayPrice", "standardRoomPrice", "vipSuitePrice", "averageMainPrice"].includes(key)) return `${formatted} FCFA`;
    if (key === "longStayDiscount") return `${formatted} %`;
    if (key === "maxAdults") return `${formatted} adulte(s)`;
    if (key === "bedrooms") return `${formatted} chambre(s)`;
    if (key === "meetingRoomCapacity") return `${formatted} place(s)`;
    return formatted;
  }
  return String(value);
}

function statusLabel(status: EstablishmentStatus) {
  if (status === "approved") return "Publié";
  if (status === "rejected") return "Refusé";
  return "En attente";
}

export function AdminModeration({ onDataChange }: { onDataChange?: () => void }) {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [typeFilter, setTypeFilter] = useState<EstablishmentType | "all">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Establishment | null>(null);
  const [rejecting, setRejecting] = useState<Establishment | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadEstablishments = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/admin/establishments", { cache: "no-store" });
      const result = await response.json() as { establishments?: Establishment[]; photoUrls?: Record<string, string>; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Impossible de charger les établissements.");
      setEstablishments(result.establishments ?? []);
      setPhotoUrls(result.photoUrls ?? {});
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de charger les établissements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadEstablishments(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadEstablishments]);

  const filtered = useMemo(() => establishments.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.business_type === typeFilter;
    const needle = search.trim().toLocaleLowerCase("fr");
    const matchesSearch = !needle || [item.name, item.address, item.phone].some((value) => value.toLocaleLowerCase("fr").includes(needle));
    return matchesStatus && matchesType && matchesSearch;
  }), [establishments, search, statusFilter, typeFilter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeStatusFilter(status: StatusFilter) {
    setStatusFilter(status);
    setPage(1);
  }

  async function updateStatus(establishment: Establishment, status: "approved" | "rejected", reason?: string) {
    setBusyId(establishment.id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/establishments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: establishment.id, status, reason }),
      });
      const result = await response.json() as { establishment?: Establishment; error?: string };
      if (!response.ok || !result.establishment) throw new Error(result.error ?? "Impossible de modérer cette fiche.");
      const nextRecord = result.establishment;
      setEstablishments((current) => current.map((item) => item.id === establishment.id ? nextRecord : item));
      onDataChange?.();
      setSelected(null);
      setRejecting(null);
      setRejectionReason("");

      if (status === "rejected") {
        try {
          const response = await fetch("/api/admin/establishments/rejection-notice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ establishmentId: establishment.id }),
          });
          const result = await response.json() as { error?: string };
          if (!response.ok) throw new Error(result.error ?? "erreur inconnue");
        } catch (cause) {
          const reason = cause instanceof Error ? cause.message : "erreur inconnue";
          setError(`La fiche a été refusée et le motif est enregistré. L’e-mail n’a pas pu être envoyé : ${reason}`);
          return;
        }
        setNotice(`La fiche de ${establishment.name} a été refusée. Le motif a été envoyé par e-mail au partenaire.`);
      } else {
        setNotice(`${establishment.name} est approuvé et publié.`);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de modifier le statut de cette fiche.");
    } finally {
      setBusyId(null);
    }
  }

  async function resendRejectionNotice(establishment: Establishment) {
    setBusyId(establishment.id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/establishments/rejection-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ establishmentId: establishment.id }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "L’e-mail n’a pas pu être envoyé.");
      setNotice(`Le motif de refus de ${establishment.name} a été envoyé par e-mail.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L’e-mail n’a pas pu être envoyé.");
    } finally {
      setBusyId(null);
    }
  }

  function submitRejection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejecting) return;
    void updateStatus(rejecting, "rejected", rejectionReason.trim());
  }

  if (loading) return <p className="mt-6 text-sm text-kaolin/70">Chargement des établissements…</p>;

  const detailsCategory = selected?.details?.[selected.business_type];

  return <section aria-labelledby="establishment-moderation-heading" className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl text-white" id="establishment-moderation-heading">Gestion des établissements</h2>
        <p className="mt-1 text-sm text-kaolin/65">Consultez les fiches, examinez leurs détails et suivez leur statut de publication.</p>
      </div>
      <button className="min-h-10 rounded-lg border border-gold/30 px-3 text-sm font-semibold text-gold hover:bg-gold/10" onClick={() => void loadEstablishments()} type="button">Actualiser</button>
    </header>

    <div aria-label="Filtrer par statut" className="flex flex-wrap gap-2" role="group">
      {([
        ["pending", "En attente"],
        ["approved", "Publiés"],
        ["rejected", "Refusés"],
        ["all", "Tous"],
      ] as const).map(([value, label]) => {
        const count = value === "all" ? establishments.length : establishments.filter((item) => item.status === value).length;
        return <button
          aria-pressed={statusFilter === value}
          className={`min-h-10 rounded-xl border px-3 text-sm font-bold transition ${statusFilter === value ? "border-gold bg-gold text-earth" : "border-gold/20 bg-earth/40 text-kaolin/75 hover:border-gold/50"}`}
          key={value}
          onClick={() => changeStatusFilter(value)}
          type="button"
        >{label} <span className="ml-1 opacity-75">{count}</span></button>;
      })}
    </div>

    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
      <label className="block text-sm font-semibold text-kaolin">
        Rechercher
        <input className="mt-1.5 min-h-11 w-full rounded-xl border border-gold/20 bg-earth/70 px-3 text-white outline-none focus:border-gold" onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nom, adresse ou téléphone" type="search" value={search} />
      </label>
      <label className="block text-sm font-semibold text-kaolin">
        Catégorie
        <select className="mt-1.5 min-h-11 w-full rounded-xl border border-gold/20 bg-earth/70 px-3 text-white outline-none focus:border-gold" onChange={(event) => { setTypeFilter(event.target.value as EstablishmentType | "all"); setPage(1); }} value={typeFilter}>
          <option value="all">Toutes les catégories</option>
          {Object.entries(establishmentTypes).map(([value, type]) => <option key={value} value={value}>{type.plural}</option>)}
        </select>
      </label>
    </div>

    {error && <p aria-live="polite" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
    {notice && <p aria-live="polite" className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-100">{notice}</p>}
    {!error && filtered.length === 0 && <p className="rounded-xl border border-gold/20 bg-earth/50 p-5 text-sm text-kaolin/70">Aucun établissement ne correspond à ces filtres.</p>}

    {visibleItems.length > 0 && <div className="overflow-x-auto rounded-2xl border border-gold/15">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-earth/80 text-xs uppercase tracking-wide text-kaolin/55">
          <tr><th className="px-4 py-3">Établissement</th><th className="px-4 py-3">Catégorie</th><th className="px-4 py-3">Soumis le</th><th className="px-4 py-3">Statut</th><th className="px-4 py-3">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-gold/10">
          {visibleItems.map((item) => <tr className="bg-panel/50" key={item.id}>
            <td className="px-4 py-4"><p className="font-bold text-white">{item.name}</p><p className="mt-1 text-xs text-kaolin/55">{item.address}</p></td>
            <td className="px-4 py-4 text-kaolin/75">{establishmentTypes[item.business_type].label}</td>
            <td className="px-4 py-4 text-kaolin/65">{new Date(item.created_at).toLocaleDateString("fr-FR")}</td>
            <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "approved" ? "bg-emerald-400/10 text-emerald-200" : item.status === "rejected" ? "bg-red-400/10 text-red-200" : "bg-amber-400/10 text-amber-100"}`}>{statusLabel(item.status)}</span></td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <button className="min-h-9 rounded-lg border border-gold/25 px-3 text-xs font-bold text-gold hover:bg-gold/10" onClick={() => setSelected(item)} type="button">Voir le détail</button>
                {item.status === "pending" && <>
                  <button className="min-h-9 rounded-lg bg-gold px-3 text-xs font-extrabold text-earth disabled:opacity-60" disabled={busyId === item.id} onClick={() => void updateStatus(item, "approved")} type="button">Approuver</button>
                  <button className="min-h-9 rounded-lg border border-red-400/30 px-3 text-xs font-bold text-red-200 disabled:opacity-60" disabled={busyId === item.id} onClick={() => { setRejecting(item); setRejectionReason(""); }} type="button">Refuser</button>
                </>}
                {item.status === "rejected" && <button className="min-h-9 rounded-lg border border-amber-300/30 px-3 text-xs font-bold text-amber-100 disabled:opacity-60" disabled={busyId === item.id} onClick={() => void resendRejectionNotice(item)} type="button">{busyId === item.id ? "Envoi…" : "Renvoyer le motif"}</button>}
              </div>
            </td>
          </tr>)}
        </tbody>
      </table>
    </div>}

    {filtered.length > PAGE_SIZE && <nav aria-label="Pagination des établissements" className="flex items-center justify-between gap-3">
      <p className="text-sm text-kaolin/60">Page {page} sur {pageCount} · {filtered.length} fiche(s)</p>
      <div className="flex gap-2">
        <button className="min-h-10 rounded-lg border border-gold/25 px-3 text-sm font-semibold text-kaolin disabled:opacity-40" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">Précédent</button>
        <button className="min-h-10 rounded-lg border border-gold/25 px-3 text-sm font-semibold text-kaolin disabled:opacity-40" disabled={page === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} type="button">Suivant</button>
      </div>
    </nav>}

    {selected && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <section aria-labelledby="establishment-detail-heading" aria-modal="true" className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-gold/25 bg-panel shadow-2xl sm:rounded-2xl" role="dialog">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gold/15 bg-panel/95 px-5 py-4 backdrop-blur">
          <div><p className="text-xs font-bold uppercase tracking-wider text-gold">{establishmentTypes[selected.business_type].label} · {statusLabel(selected.status)}</p><h3 className="font-display mt-1 text-xl text-white" id="establishment-detail-heading">{selected.name}</h3></div>
          <button aria-label="Fermer les détails" className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/30 text-2xl text-white hover:bg-gold/10" onClick={() => setSelected(null)} type="button">×</button>
        </header>
        <div className="overflow-y-auto p-5">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div><dt className="text-xs font-bold uppercase text-kaolin/50">Téléphone</dt><dd className="mt-1 text-kaolin">{selected.phone}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-kaolin/50">Adresse</dt><dd className="mt-1 text-kaolin">{selected.address}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs font-bold uppercase text-kaolin/50">Description</dt><dd className="mt-1 whitespace-pre-wrap leading-6 text-kaolin/80">{selected.description}</dd></div>
            <div className="sm:col-span-2"><dt className="text-xs font-bold uppercase text-kaolin/50">Équipements</dt><dd className="mt-1 text-kaolin/80">{selected.equipment.length ? selected.equipment.join(" · ") : "Non renseignés"}</dd></div>
            {detailsCategory && <div className="sm:col-span-2"><dt className="text-xs font-bold uppercase text-kaolin/50">Informations complémentaires</dt><dd className="mt-2 grid gap-2 sm:grid-cols-2">{Object.entries(detailsCategory).map(([key, value]) => <p className="rounded-lg bg-earth/60 p-3 text-sm text-kaolin/80" key={key}><span className="block text-xs font-semibold text-kaolin/50">{formatDetailKey(key)}</span><span className="mt-1 block">{formatDetailValue(key, value)}</span></p>)}</dd></div>}
            {selected.rejection_reason && <div className="sm:col-span-2"><dt className="text-xs font-bold uppercase text-red-200/70">Motif de refus</dt><dd className="mt-1 whitespace-pre-wrap text-red-100">{selected.rejection_reason}</dd></div>}
          </dl>
          {selected.photos.length > 0 && <div className="mt-5"><h4 className="text-xs font-bold uppercase text-kaolin/50">Photos ({selected.photos.length})</h4><div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">{selected.photos.map((path, index) => {
            const photoUrl = photoUrls[path];
            return photoUrl ? <a aria-label={`Ouvrir la photo ${index + 1} de ${selected.name}`} className="overflow-hidden rounded-xl border border-gold/20" href={photoUrl} key={path} rel="noreferrer" target="_blank"><img alt={`${selected.name} — photo ${index + 1}`} className="h-36 w-full object-cover" src={photoUrl} /></a> : null;
          })}</div></div>}
        </div>
        {selected.status === "pending" && <footer className="flex flex-wrap justify-end gap-2 border-t border-gold/15 bg-panel px-5 py-4">
          <button className="min-h-11 rounded-xl border border-red-400/35 px-4 text-sm font-bold text-red-100" onClick={() => { setRejecting(selected); setSelected(null); setRejectionReason(""); }} type="button">Refuser avec motif</button>
          <button className="min-h-11 rounded-xl bg-gold px-4 text-sm font-extrabold text-earth disabled:opacity-60" disabled={busyId === selected.id} onClick={() => void updateStatus(selected, "approved")} type="button">Approuver et publier</button>
        </footer>}
      </section>
    </div>}

    {rejecting && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <form aria-labelledby="rejection-heading" aria-modal="true" className="w-full max-w-lg rounded-2xl border border-red-300/20 bg-panel p-5 shadow-2xl sm:p-6" onSubmit={submitRejection} role="dialog">
        <h3 className="font-display text-2xl text-white" id="rejection-heading">Motif du refus</h3>
        <p className="mt-2 text-sm leading-6 text-kaolin/65">Le motif sera conservé dans le dossier et envoyé par e-mail au partenaire de « {rejecting.name} ». Le partenaire pourra corriger sa fiche et la soumettre à nouveau.</p>
        <label className="mt-4 block text-sm font-semibold text-kaolin">Motif précis
          <textarea autoFocus className="mt-2 min-h-32 w-full rounded-xl border border-gold/25 bg-earth px-3 py-3 text-white outline-none focus:border-gold" maxLength={1000} minLength={5} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Ex. Les photos ne permettent pas de vérifier les équipements annoncés." required value={rejectionReason} />
        </label>
        <p className="mt-1 text-right text-xs text-kaolin/45">{rejectionReason.length}/1 000</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button className="min-h-11 rounded-xl border border-gold/25 px-4 text-sm font-semibold text-kaolin" onClick={() => setRejecting(null)} type="button">Annuler</button>
          <button className="min-h-11 rounded-xl bg-red-700 px-4 text-sm font-bold text-white disabled:opacity-60" disabled={busyId === rejecting.id || rejectionReason.trim().length < 5} type="submit">{busyId === rejecting.id ? "Enregistrement…" : "Refuser et notifier"}</button>
        </div>
      </form>
    </div>}
  </section>;
}
