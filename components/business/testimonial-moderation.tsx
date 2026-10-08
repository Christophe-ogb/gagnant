"use client";

import { useCallback, useEffect, useState } from "react";

type Testimonial = {
  id: string;
  nom: string;
  fonction: string;
  temoignage: string;
  note: number;
  photo_url: string | null;
  affiche: boolean;
  created_at: string;
};

export function TestimonialModeration({ onDataChange }: { onDataChange?: () => void }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadTestimonials = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/testimonials", { cache: "no-store" });
      const result = await response.json() as { testimonials?: Testimonial[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Impossible de charger les témoignages.");
      setTestimonials(result.testimonials ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de charger les témoignages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadTestimonials(); }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadTestimonials]);

  async function moderate(testimonial: Testimonial, action: "publish" | "hide" | "delete") {
    setBusyId(testimonial.id);
    setError(null);
    setNotice(null);
    try {
      if (action === "delete") {
        const response = await fetch("/api/admin/testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: testimonial.id, action }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Impossible de supprimer ce témoignage.");
        setTestimonials((current) => current.filter((item) => item.id !== testimonial.id));
        onDataChange?.();
        setNotice("Le témoignage a été supprimé.");
        return;
      }

      const afficher = action === "publish";
      const response = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: testimonial.id, action, currentStatus: testimonial.affiche }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Impossible de modérer ce témoignage.");
      setTestimonials((current) => current.map((item) => item.id === testimonial.id ? { ...item, affiche: afficher } : item));
      onDataChange?.();
      setNotice(afficher ? "Le témoignage est publié sur le site." : "Le témoignage a été retiré du site.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de modérer ce témoignage.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="mt-6 text-sm text-kaolin/70">Chargement des témoignages…</p>;

  return <section aria-labelledby="testimonial-moderation-heading" className="mt-10 space-y-5">
    <div>
      <h2 className="font-display text-2xl text-white" id="testimonial-moderation-heading">Avis et témoignages</h2>
      <p className="mt-1 text-sm text-kaolin/65">Publiez les témoignages retenus, retirez ceux déjà publiés ou supprimez ceux que vous refusez.</p>
    </div>
    {error && <p aria-live="polite" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}
    {notice && <p aria-live="polite" className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-sm text-emerald-100">{notice}</p>}
    {!error && testimonials.length === 0 && <p className="rounded-xl border border-gold/20 bg-earth/50 p-5 text-sm text-kaolin/70">Aucun témoignage à modérer.</p>}
    {testimonials.map((item) => <article className="rounded-2xl border border-gold/25 bg-earth/50 p-5" key={item.id}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {item.photo_url
            ? <img alt="" className="size-12 rounded-full border border-gold/50 object-cover" src={item.photo_url} />
            : <span aria-hidden="true" className="grid size-12 place-items-center rounded-full border border-gold/45 bg-gold/10 font-bold text-gold">{item.nom.charAt(0).toUpperCase()}</span>}
          <div>
            <h3 className="font-bold text-white">{item.nom}</h3>
            <p className="text-sm text-gold/80">{item.fonction} · {item.note}/5</p>
            <p className={`mt-1 text-xs font-bold ${item.affiche ? "text-emerald-300" : "text-amber-200"}`}>{item.affiche ? "Publié" : "En attente de validation"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.affiche
            ? <button className="min-h-10 rounded-lg border border-gold/35 px-3 text-sm font-bold text-gold disabled:opacity-60" disabled={busyId === item.id} onClick={() => void moderate(item, "hide")} type="button">Retirer du site</button>
            : <button className="min-h-10 rounded-lg bg-gold px-3 text-sm font-extrabold text-earth disabled:opacity-60" disabled={busyId === item.id} onClick={() => void moderate(item, "publish")} type="button">Publier</button>}
          <button
            className="min-h-10 rounded-lg border border-red-400/40 px-3 text-sm font-bold text-red-200 disabled:opacity-60"
            disabled={busyId === item.id}
            onClick={() => {
              if (window.confirm(`Supprimer définitivement le témoignage de « ${item.nom} » ?`)) void moderate(item, "delete");
            }}
            type="button"
          >
            Supprimer
          </button>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-kaolin/80">« {item.temoignage} »</p>
      <p className="mt-3 text-xs text-kaolin/50">Reçu le {new Date(item.created_at).toLocaleDateString("fr-FR")}</p>
    </article>)}
  </section>;
}
