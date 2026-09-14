import { BookOpenText, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { QuizCard } from "@/components/quiz-card";
import { HeritagePhotoStory } from "@/components/heritage-photo-story";
import { ReturnToExploration } from "@/components/return-to-exploration";
import { getAllHeritage, getHeritageById } from "@/lib/heritage";

// Les fiches sont enrichies régulièrement depuis les fichiers de données.
// Cette option évite d'afficher une ancienne fiche pré-générée pendant l'édition.
export const dynamic = "force-dynamic";

const typeLabel = {
  commune: "Commune",
  site: "Site culturel",
  divinite: "Patrimoine spirituel",
  roi: "Roi & histoire",
  contemporain: "Bénin contemporain",
  "evenement-national": "Fête & événement",
};

// Seules les quatre communes mises en avant sur l'accueil ont une visite guidée publique pour le moment.
const featuredCommunesWithGuidedTour = new Set(["ouidah", "abomey", "ganvie", "natitingou"]);

export function generateStaticParams() {
  return getAllHeritage().map(({ id }) => ({ id }));
}

export default async function HeritageScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const heritage = getHeritageById(id);

  if (!heritage) {
    notFound();
  }

  const story = heritage.descriptionHistoire.split(/\n\n+/).map((part) => {
    const [title, ...text] = part.split("\n");
    return { title, paragraphs: text.filter(Boolean) };
  });

  const placesAsScenes = heritage.lieuxAVisiter?.map((place) => ({
    titre: place.nom,
    localisation: heritage.communeAssociee,
    texte: place.description,
    imageUrl: place.imageUrl,
    imageAlt: place.imageAlt,
    // Les photos officielles des lieux de Zè sont encore en attente.
    imagePending: heritage.id === "ze" || place.imagePending || heritage.imagePending,
  }));
  const showGuidedTour = heritage.type !== "commune" || featuredCommunesWithGuidedTour.has(heritage.id);
  const returnTarget = heritage.type === "commune"
    ? { href: "/communes", label: "Retour aux communes" }
    : heritage.type === "roi"
      ? { href: "/royaumes", label: "Retour aux royaumes" }
      : heritage.type === "contemporain"
        ? { href: "/contemporain/personnalites", label: "Retour aux personnalités" }
        : heritage.type === "evenement-national"
          ? { href: "/evenements", label: "Retour aux fêtes et événements" }
          : undefined;

  return (
    <main className="min-h-screen bg-earth px-5 py-5 text-kaolin sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <ReturnToExploration {...returnTarget} />

        <article className="mt-5 overflow-hidden rounded-3xl border border-gold/25 bg-panel shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="relative min-h-90 overflow-hidden sm:min-h-105">
            {heritage.imagePending ? (
              <div className="absolute inset-0 grid place-items-center bg-[#251910] px-6 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold">Image bientôt disponible</p>
              </div>
            ) : (
              <img
                src={heritage.imageUrl}
                alt={heritage.imageAlt}
                className="absolute inset-0 h-full w-full object-cover opacity-75"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b] via-[#1a120b]/55 to-transparent" />
            <div className="relative flex min-h-90 flex-col justify-end p-6 sm:min-h-105 sm:p-9">
              <span className="w-fit rounded-full border border-gold/45 bg-earth/55 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-gold backdrop-blur-sm">
                {typeLabel[heritage.type]} · {heritage.communeAssociee}
              </span>
              <h1 className="font-display mt-4 text-4xl leading-tight text-white sm:text-5xl">{heritage.nom}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-kaolin/80 sm:text-base">{heritage.sousTitre}</p>
            </div>
          </div>

          <div className="space-y-8 p-6 sm:p-9">
            <section aria-labelledby="histoire">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                <BookOpenText aria-hidden="true" size={16} /> L’histoire
              </p>
              {story.length > 1 && story.every((beat) => /^\d+[.]/.test(beat.title.trim())) ? (
                <div className="mt-4 space-y-5">
                  {story.map((beat, index) => (
                    <div key={beat.title} className="flex gap-4 border-l border-gold/35 pl-4">
                      <span className="font-display text-xl text-gold">0{index + 1}</span>
                      <div>
                        <h2 id={index === 0 ? "histoire" : undefined} className="font-display text-2xl text-white">{beat.title}</h2>
                        <div className="mt-3 space-y-3 text-sm leading-7 text-kaolin/80 sm:text-base">{beat.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <h2 id="histoire" className="font-display mt-3 text-2xl text-white">Une mémoire à découvrir</h2>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-kaolin/80 sm:text-base">{heritage.descriptionHistoire.split(/\n\n+/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
                </>
              )}
            </section>

            <section className="rounded-2xl border border-gold/25 bg-gold/10 p-5" aria-labelledby="saviez-vous">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                <Sparkles aria-hidden="true" size={16} /> Le saviez-vous ?
              </p>
              <p id="saviez-vous" className="mt-3 text-sm leading-7 text-kaolin/85 sm:text-base">{heritage.leSaviezVous}</p>
            </section>

            {/* Visite guidée temporairement masquée pour les communes hors sélection de l'accueil. */}
            {showGuidedTour && placesAsScenes && placesAsScenes.length > 0 && <HeritagePhotoStory
              scenes={placesAsScenes}
              heritageName={heritage.nom}
              heading={`Les lieux qui racontent ${heritage.nom}`}
              description="Choisis un lieu ou utilise les flèches pour poursuivre la visite."
              itemLabel="Lieu"
            />}

            {heritage.type !== "roi" && heritage.type !== "contemporain" && heritage.isReady !== false && heritage.scenes && heritage.scenes.length > 0 && <HeritagePhotoStory
              scenes={heritage.scenes}
              heritageName={heritage.nom}
            />}

            {heritage.isReady !== false ? (
              <div className="mt-4"><QuizCard heritageId={heritage.id} heritageName={heritage.nom} challenge={heritage.challenge} quiz={heritage.quiz} /></div>
            ) : (
              <section className="rounded-2xl border border-gold/30 bg-gold/10 p-5 text-center" aria-label="Fiche en préparation">
                <h2 className="font-display text-2xl text-white">L’histoire de {heritage.nom} arrive bientôt.</h2>
              </section>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
