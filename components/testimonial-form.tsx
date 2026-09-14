"use client";

import { createClient } from "@supabase/supabase-js";
import { CheckCircle2, ImagePlus, MessageSquareQuote, Send, Star, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type FormStatus = "idle" | "sending" | "success" | "error";

export function TestimonialForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [note, setNote] = useState(5);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const closeWithEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  async function submitTestimonial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      setStatus("error");
      setMessage("Le formulaire n’est pas encore connecté. Ajoute les clés Supabase dans .env.local.");
      return;
    }

    const form = new FormData(formElement);
    let photoUrl: string | null = null;
    const payload: {
      nom: string;
      fonction: string;
      temoignage: string;
      note: number;
      photo_url: string | null;
      affiche: boolean;
    } = {
      nom: String(form.get("nom") ?? "").trim(),
      fonction: String(form.get("fonction") ?? "").trim(),
      temoignage: String(form.get("temoignage") ?? "").trim(),
      note,
      photo_url: photoUrl,
      affiche: false,
    };

    setStatus("sending");
    setMessage("");
    try {
      if (photo) {
        const extension = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const photoPath = `temoignages/${crypto.randomUUID()}.${extension}`;
        const supabase = createClient(url, anonKey);
        const { error: uploadError } = await supabase.storage.from("temoignages").upload(photoPath, photo, {
          cacheControl: "3600",
          contentType: photo.type,
          upsert: false,
        });
        if (uploadError) throw new Error(`Photo : ${uploadError.message}`);
        photoUrl = supabase.storage.from("temoignages").getPublicUrl(photoPath).data.publicUrl;
        payload.photo_url = photoUrl;
      }
      const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/temoignages`, {
        method: "POST",
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(errorBody?.message ?? `Erreur Supabase (${response.status})`);
      }
      formElement.reset();
      setNote(5);
      setPhoto(null);
      setPhotoPreview(null);
      setStatus("success");
      setMessage("Merci ! Ton témoignage a bien été envoyé. Il sera publié après validation.");
      setIsOpen(false);
      setIsSuccessOpen(true);
    } catch (error) {
      console.error("Erreur d’envoi du témoignage :", error);
      setStatus("error");
      const detail = error instanceof Error ? error.message : "Erreur inconnue";
      setMessage(`L’envoi n’a pas abouti : ${detail}`);
    }
  }

  function choosePhoto(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Choisis uniquement une image au format JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      setMessage("La photo doit peser 5 Mo maximum.");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setStatus("idle");
    setMessage("");
  }

  return (
    <>
      <button type="button" onClick={() => { setMessage(""); setStatus("idle"); setIsOpen(true); }} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth shadow-[0_12px_30px_rgba(212,175,55,0.2)] transition hover:bg-[#ebc94e] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"><MessageSquareQuote aria-hidden="true" size={18} /> Donner mon avis ou témoignage</button>

      {isOpen && <div className="fixed inset-0 z-50 grid place-items-end bg-black/75 p-0 backdrop-blur-sm sm:place-items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="testimonial-title">
        <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-gold/55 bg-[#20140d] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_0_60px_rgba(212,175,55,0.22)] sm:rounded-3xl sm:p-7">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">Gagnants 229</p><h3 id="testimonial-title" className="font-display mt-2 text-2xl text-white">Partagez votre expérience</h3><p className="mt-2 text-sm leading-6 text-kaolin/70">Votre message sera lu avant toute publication sur la plateforme.</p></div><button type="button" onClick={() => setIsOpen(false)} className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 text-kaolin/75 transition hover:border-gold hover:text-gold active:scale-95" aria-label="Fermer le formulaire"><X aria-hidden="true" size={19} /></button></div>
    <form onSubmit={submitTestimonial} className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-earth/35 p-4 text-left sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-kaolin">Nom complet<input name="nom" required maxLength={100} placeholder="Ex. Christophe OGOUBIYI" className="min-h-12 rounded-xl border border-white/15 bg-earth/70 px-4 text-sm font-medium text-white outline-none placeholder:text-kaolin/40 focus:border-gold" /></label>
        <label className="grid gap-2 text-sm font-bold text-kaolin">Fonction<input name="fonction" required maxLength={120} placeholder="Ex. Enseignant, joueur, parent…" className="min-h-12 rounded-xl border border-white/15 bg-earth/70 px-4 text-sm font-medium text-white outline-none placeholder:text-kaolin/40 focus:border-gold" /></label>
      </div>
      <div>
        <p className="text-sm font-bold text-kaolin">Votre note</p>
        <div className="mt-2 flex gap-1" aria-label={`Note de ${note} sur 5`}>{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setNote(value)} className="grid size-10 place-items-center rounded-lg text-gold transition hover:bg-gold/15 active:scale-95" aria-label={`Donner ${value} étoile${value > 1 ? "s" : ""}`}><Star aria-hidden="true" size={22} fill={value <= note ? "currentColor" : "none"} /></button>)}</div>
      </div>
      <div>
        <p className="text-sm font-bold text-kaolin">Photo de profil <span className="font-normal text-kaolin/50">(facultatif)</span></p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {photoPreview ? <div className="relative size-16 overflow-hidden rounded-full border-2 border-gold"><img src={photoPreview} alt="Aperçu de votre photo" className="h-full w-full object-cover" /></div> : <div className="grid size-16 place-items-center rounded-full border border-dashed border-gold/50 bg-gold/10 text-gold"><ImagePlus aria-hidden="true" size={24} /></div>}
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-gold/45 bg-gold/10 px-4 py-2 text-sm font-extrabold text-gold transition hover:bg-gold hover:text-earth">{photo ? "Changer la photo" : "Ajouter une photo"}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => choosePhoto(event.target.files?.[0] ?? null)} /></label>
          {photo && <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="min-h-11 text-sm font-bold text-kaolin/65 transition hover:text-gold">Retirer</button>}
        </div>
        <p className="mt-2 text-xs leading-5 text-kaolin/50">JPG, PNG ou WebP · 5 Mo maximum. Cette photo est facultative et ne sera utilisée qu’après validation.</p>
      </div>
      <label className="grid gap-2 text-sm font-bold text-kaolin">Votre témoignage ou idée<textarea name="temoignage" required minLength={20} maxLength={1200} rows={5} placeholder="Partagez votre expérience ou votre idée d’amélioration…" className="resize-y rounded-xl border border-white/15 bg-earth/70 px-4 py-3 text-sm font-medium leading-6 text-white outline-none placeholder:text-kaolin/40 focus:border-gold" /></label>
      <button type="submit" disabled={status === "sending"} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-extrabold text-earth shadow-[0_12px_30px_rgba(212,175,55,0.2)] transition hover:bg-[#ebc94e] disabled:cursor-wait disabled:opacity-70 active:scale-95"><Send aria-hidden="true" size={18} />{status === "sending" ? "Envoi en cours…" : "Envoyer mon témoignage"}</button>
      {message && <p className={`flex items-start gap-2 rounded-xl border p-3 text-sm leading-6 ${status === "success" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" : "border-laterite/50 bg-laterite/10 text-kaolin"}`}>{status === "success" && <CheckCircle2 className="mt-0.5 shrink-0" aria-hidden="true" size={18} />}{message}</p>}
    </form>
        </div>
      </div>}
      {isSuccessOpen && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-5 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="testimonial-success-title">
        <div className="w-full max-w-md rounded-3xl border border-gold/60 bg-[#20140d] p-7 text-center shadow-[0_0_70px_rgba(212,175,55,0.28)] sm:p-9">
          <div className="mx-auto grid size-20 place-items-center rounded-full border-2 border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-[0_0_32px_rgba(52,211,153,0.22)]"><CheckCircle2 aria-hidden="true" size={42} /></div>
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-gold">Gagnants 229</p>
          <h3 id="testimonial-success-title" className="font-display mt-3 text-3xl text-white">Merci pour votre avis !</h3>
          <p className="mt-4 text-sm leading-7 text-kaolin/75">Votre témoignage a bien été reçu. Il sera examiné avant une éventuelle mise en avant sur la plateforme.</p>
          <button type="button" onClick={() => setIsSuccessOpen(false)} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-6 py-3 text-sm font-extrabold text-earth transition hover:bg-[#ebc94e] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Compris, merci !</button>
        </div>
      </div>}
    </>
  );
}
