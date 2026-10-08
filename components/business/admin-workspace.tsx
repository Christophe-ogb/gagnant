"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  LayoutDashboard,
  Mail,
  MessageSquareQuote,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AdminModeration } from "@/components/business/admin-moderation";
import { EmailAnnouncementCampaign } from "@/components/business/email-announcement-campaign";
import { TestimonialModeration } from "@/components/business/testimonial-moderation";
import { establishmentTypes, type EstablishmentType } from "@/lib/establishments";

type Section = "overview" | "establishments" | "members" | "testimonials" | "announcements";
type Profile = { id: string; full_name: string; email: string | null; role: string; created_at: string; isPartner: boolean };

type AdminStats = {
  members: number;
  partners: number;
  pending: number;
  approved: number;
  rejected: number;
  publishedTestimonials: number;
  categories: Record<EstablishmentType, number>;
};

const emptyStats: AdminStats = {
  members: 0,
  partners: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  publishedTestimonials: 0,
  categories: { hotel: 0, restaurant: 0, apartment: 0 },
};

const sections: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Vue d’ensemble", icon: LayoutDashboard },
  { id: "establishments", label: "Établissements", icon: Building2 },
  { id: "members", label: "Membres", icon: Users },
  { id: "testimonials", label: "Avis et modération", icon: MessageSquareQuote },
  { id: "announcements", label: "Annonces e-mail", icon: Mail },
];

const PAGE_SIZE = 12;

function StatCard({ label, value, hint, accent = "gold" }: { label: string; value: number; hint: string; accent?: "gold" | "amber" | "green" | "red" }) {
  const colors = {
    gold: "border-gold/20 before:bg-gold text-gold",
    amber: "border-amber-300/20 before:bg-amber-300 text-amber-200",
    green: "border-emerald-300/20 before:bg-emerald-300 text-emerald-200",
    red: "border-red-300/20 before:bg-red-300 text-red-200",
  }[accent];
  return <article className={`relative overflow-hidden rounded-2xl border bg-panel p-5 before:absolute before:inset-y-0 before:left-0 before:w-1 ${colors.split(" ").slice(0, 2).join(" ")}`}>
    <p className="text-sm font-semibold text-kaolin/65">{label}</p>
    <p className={`mt-3 font-display text-4xl ${colors.split(" ")[2]}`}>{new Intl.NumberFormat("fr-FR").format(value)}</p>
    <p className="mt-2 text-xs text-kaolin/50">{hint}</p>
  </article>;
}

export function AdminWorkspace() {
  const [section, setSection] = useState<Section>("overview");
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [membersPage, setMembersPage] = useState(1);
  const [memberCount, setMemberCount] = useState(0);
  const [memberSearch, setMemberSearch] = useState("");

  const loadDashboardData = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    setProfilesError(null);
    setProfilesLoading(true);
    try {
      const params = new URLSearchParams({ page: String(membersPage), search: memberSearch });
      const response = await fetch(`/api/admin/dashboard?${params}`, { cache: "no-store" });
      const result = await response.json() as {
        error?: string;
        stats?: AdminStats;
        profiles?: Profile[];
        profileCount?: number;
      };
      if (!response.ok) throw new Error(result.error ?? "Impossible de charger le tableau de bord.");
      if (result.stats) setStats(result.stats);
      setProfiles(result.profiles ?? []);
      setMemberCount(result.profileCount ?? 0);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Impossible de charger les données du tableau de bord.";
      setStatsError(message);
      setProfilesError(message);
    } finally {
      setStatsLoading(false);
      setProfilesLoading(false);
    }
  }, [memberSearch, membersPage]);

  useEffect(() => {
    if (section !== "overview" && section !== "members") return;
    const timeout = window.setTimeout(() => { void loadDashboardData(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadDashboardData, section]);

  const memberPageCount = Math.max(1, Math.ceil(memberCount / PAGE_SIZE));
  function renderContent() {
    if (section === "establishments") return <AdminModeration onDataChange={() => void loadDashboardData()} />;
    if (section === "testimonials") return <TestimonialModeration onDataChange={() => void loadDashboardData()} />;
    if (section === "announcements") return <EmailAnnouncementCampaign />;
    if (section === "members") {
      return <section aria-labelledby="members-heading" className="space-y-5">
        <div><h2 className="font-display text-2xl text-white" id="members-heading">Membres et partenaires</h2><p className="mt-1 text-sm text-kaolin/65">Liste des comptes, adresses de contact et rôles attribués.</p></div>
        <label className="block max-w-lg text-sm font-semibold text-kaolin">Rechercher un membre
          <input className="mt-1.5 min-h-11 w-full rounded-xl border border-gold/20 bg-earth/70 px-3 text-white outline-none focus:border-gold" onChange={(event) => { setMemberSearch(event.target.value); setMembersPage(1); }} placeholder="Nom ou adresse e-mail" type="search" value={memberSearch} />
        </label>
        {profilesError && <p aria-live="polite" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{profilesError}</p>}
        {profilesLoading ? <p className="text-sm text-kaolin/65">Chargement des comptes…</p> : profiles.length === 0
          ? <p className="rounded-xl border border-gold/20 bg-earth/50 p-5 text-sm text-kaolin/70">Aucun compte ne correspond à cette recherche.</p>
          : <div className="overflow-x-auto rounded-2xl border border-gold/15"><table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-earth/80 text-xs uppercase tracking-wide text-kaolin/55"><tr><th className="px-4 py-3">Membre</th><th className="px-4 py-3">Adresse e-mail</th><th className="px-4 py-3">Rôle</th><th className="px-4 py-3">Inscription</th></tr></thead>
            <tbody className="divide-y divide-gold/10">{profiles.map((profile) => <tr className="bg-panel/50" key={profile.id}>
              <td className="px-4 py-4 font-semibold text-white">{profile.full_name || "Nom non renseigné"}</td>
              <td className="px-4 py-4 text-kaolin/75">{profile.email ?? "Adresse indisponible"}</td>
              <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${profile.role === "admin" ? "bg-gold/15 text-gold" : profile.isPartner ? "bg-sky-300/10 text-sky-100" : "bg-earth text-kaolin/75"}`}>{profile.role === "admin" ? "Administrateur" : profile.isPartner ? "Partenaire" : "Membre"}</span></td>
              <td className="px-4 py-4 text-kaolin/60">{new Date(profile.created_at).toLocaleDateString("fr-FR")}</td>
            </tr>)}</tbody>
          </table></div>}
        {memberCount > PAGE_SIZE && <nav aria-label="Pagination des membres" className="flex items-center justify-between gap-3">
          <p className="text-sm text-kaolin/60">Page {membersPage} sur {memberPageCount} · {memberCount} compte(s)</p>
          <div className="flex gap-2">
            <button className="min-h-10 rounded-lg border border-gold/25 px-3 text-sm text-kaolin disabled:opacity-40" disabled={membersPage === 1} onClick={() => setMembersPage((page) => Math.max(1, page - 1))} type="button">Précédent</button>
            <button className="min-h-10 rounded-lg border border-gold/25 px-3 text-sm text-kaolin disabled:opacity-40" disabled={membersPage === memberPageCount} onClick={() => setMembersPage((page) => Math.min(memberPageCount, page + 1))} type="button">Suivant</button>
          </div>
        </nav>}
      </section>;
    }

    return <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="font-display text-2xl text-white">Vue d’ensemble</h2><p className="mt-1 text-sm text-kaolin/65">Activité de la plateforme et éléments nécessitant votre attention.</p></div>
        <button className="min-h-10 rounded-lg border border-gold/30 px-3 text-sm font-semibold text-gold hover:bg-gold/10" onClick={() => void loadDashboardData()} type="button">Actualiser les chiffres</button>
      </div>
      {statsError && <p aria-live="polite" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">Les statistiques n’ont pas pu être chargées : {statsError}</p>}
      <div aria-live="polite" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Comptes inscrits" value={statsLoading ? 0 : stats.members} hint="Tous les profils de la plateforme" />
        <StatCard label="Partenaires" value={statsLoading ? 0 : stats.partners} hint="Comptes avec une fiche d’établissement" />
        <StatCard label="À valider" value={statsLoading ? 0 : stats.pending} hint="Demandes en attente de modération" accent="amber" />
        <StatCard label="Établissements publiés" value={statsLoading ? 0 : stats.approved} hint="Fiches visibles sur le site" accent="green" />
        <StatCard label="Fiches refusées" value={statsLoading ? 0 : stats.rejected} hint="Motif enregistré, correction possible" accent="red" />
        <StatCard label="Avis publiés" value={statsLoading ? 0 : stats.publishedTestimonials} hint="Témoignages actuellement visibles" />
      </div>
      <section aria-labelledby="category-stats-heading" className="rounded-2xl border border-gold/15 bg-panel p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div><h3 className="font-display text-xl text-white" id="category-stats-heading">Établissements publiés par catégorie</h3><p className="mt-1 text-sm text-kaolin/55">Répartition des fiches approuvées et visibles.</p></div>
          <button className="text-sm font-bold text-gold hover:underline" onClick={() => setSection("establishments")} type="button">Gérer les fiches</button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">{(Object.keys(establishmentTypes) as EstablishmentType[]).map((type) => <div className="rounded-xl bg-earth/55 p-4" key={type}><p className="text-sm text-kaolin/65">{establishmentTypes[type].plural}</p><p className="mt-2 font-display text-3xl text-white">{statsLoading ? "—" : new Intl.NumberFormat("fr-FR").format(stats.categories[type])}</p></div>)}</div>
      </section>
      <div className="rounded-xl border border-gold/15 bg-gold/5 p-4 text-sm leading-6 text-kaolin/70"><strong className="text-gold">Indicateurs financiers non disponibles :</strong> aucun module de paiement ou d’abonnement n’est présent dans la base actuelle. Les chiffres de revenus ne sont donc pas affichés pour éviter des données inventées.</div>
    </section>;
  }

  return <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
    <nav aria-label="Navigation de l’administration" className="lg:sticky lg:top-6 lg:self-start">
      <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:rounded-2xl lg:border lg:border-gold/15 lg:bg-earth/40 lg:p-3">
        {sections.map(({ id, label, icon: Icon }) => <button
          aria-current={section === id ? "page" : undefined}
          className={`flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition ${section === id ? "bg-gold text-earth" : "text-kaolin/70 hover:bg-gold/10 hover:text-white"}`}
          key={id}
          onClick={() => setSection(id)}
          type="button"
        ><Icon aria-hidden="true" size={18} />{label}{id === "establishments" && stats.pending > 0 && <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${section === id ? "bg-earth/15" : "bg-amber-300/15 text-amber-100"}`}>{stats.pending}</span>}</button>)}
      </div>
    </nav>
    <div className="min-w-0 rounded-2xl border border-gold/15 bg-earth/25 p-4 sm:p-6">
      {renderContent()}
    </div>
  </div>;
}
