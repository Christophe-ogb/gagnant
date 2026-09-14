import { Star } from "lucide-react";

type Testimonial = {
  id: string;
  nom: string;
  fonction: string;
  temoignage: string;
  note: number | null;
  photo_url: string | null;
};

async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];

  try {
    const response = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/temoignages?select=id,nom,fonction,temoignage,note,photo_url&affiche=eq.true&order=created_at.desc&limit=6`,
      {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        cache: "no-store",
      },
    );
    return response.ok ? (await response.json() as Testimonial[]) : [];
  } catch {
    return [];
  }
}

export async function PublishedTestimonials() {
  const testimonials = await getPublishedTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {testimonials.map((testimonial) => {
        const note = Math.max(1, Math.min(5, testimonial.note ?? 5));
        return (
          <article key={testimonial.id} className="flex min-h-56 flex-col rounded-2xl border border-white/10 bg-earth/45 p-5 shadow-[0_12px_28px_rgba(0,0,0,0.15)]">
            <div className="flex items-center gap-3">
              {testimonial.photo_url ? (
                <img src={testimonial.photo_url} alt={`Photo de ${testimonial.nom}`} className="size-12 rounded-full border border-gold/60 object-cover" />
              ) : (
                <div className="grid size-12 place-items-center rounded-full border border-gold/45 bg-gold/10 text-lg font-extrabold text-gold" aria-hidden="true">{testimonial.nom.charAt(0).toUpperCase()}</div>
              )}
              <div className="min-w-0">
                <h3 className="truncate font-display text-xl text-white">{testimonial.nom}</h3>
                <p className="truncate text-xs font-bold text-gold/85">{testimonial.fonction}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-1 text-gold" aria-label={`Note de ${note} sur 5`}>
              {[1, 2, 3, 4, 5].map((value) => <Star key={value} aria-hidden="true" size={16} fill={value <= note ? "currentColor" : "none"} />)}
            </div>
            <p className="mt-3 text-sm leading-6 text-kaolin/80">« {testimonial.temoignage} »</p>
          </article>
        );
      })}
    </div>
  );
}
