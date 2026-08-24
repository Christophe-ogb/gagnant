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
};

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

  const story = heritage.type === "roi" || heritage.type === "contemporain" || heritage.type === "commune"
    ? heritage.descriptionHistoire.split(/\n\n+/).map((part) => {
        const [title, ...text] = part.split("\n");
        return { title, text: text.join(" ") };
      })
    : [];

  const placesAsScenes = heritage.lieuxAVisiter?.map((place) => ({
    titre: place.nom,
    localisation: heritage.communeAssociee,
    texte: place.description,
    imageUrl: place.imageUrl,
    imageAlt: place.imageAlt,
  }));

  return (
    <main className="min-h-screen bg-earth px-5 py-5 text-kaolin sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <ReturnToExploration />

        <article className="mt-5 overflow-hidden rounded-3xl border border-gold/25 bg-panel shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <div className="relative min-h-90 overflow-hidden sm:min-h-105">
            <img
              src={heritage.imageUrl}
              alt={heritage.imageAlt}
              className="absolute inset-0 h-full w-full object-cover opacity-75"
            />
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
              {story.length > 1 ? (
                <div className="mt-4 space-y-5">
                  {story.map((beat, index) => (
                    <div key={beat.title} className="flex gap-4 border-l border-gold/35 pl-4">
                      <span className="font-display text-xl text-gold">0{index + 1}</span>
                      <div>
                        <h2 id={index === 0 ? "histoire" : undefined} className="font-display text-2xl text-white">{beat.title}</h2>
                        <p className="mt-2 text-sm leading-7 text-kaolin/80 sm:text-base">{beat.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <h2 id="histoire" className="font-display mt-3 text-2xl text-white">Une mémoire à découvrir</h2>
                  <p className="mt-4 text-sm leading-7 text-kaolin/80 sm:text-base">{heritage.descriptionHistoire}</p>
                </>
              )}
            </section>

            <section className="rounded-2xl border border-gold/25 bg-gold/10 p-5" aria-labelledby="saviez-vous">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                <Sparkles aria-hidden="true" size={16} /> Le saviez-vous ?
              </p>
              <p id="saviez-vous" className="mt-3 text-sm leading-7 text-kaolin/85 sm:text-base">{heritage.leSaviezVous}</p>
            </section>

            {placesAsScenes && placesAsScenes.length > 0 && <HeritagePhotoStory
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
