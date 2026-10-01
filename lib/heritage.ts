import patrimoine from "@/data/patrimoine.json";
import royalDetails from "@/data/royal-details.json";
import seriesB from "@/data/series-b.json";
import { catalogueDetails } from "@/data/catalogue-details";
import type { HeritageItem } from "@/lib/types";

const detailsById = new Map(catalogueDetails.map((item) => [item.id, item]));
const seriesBDetails = new Map((seriesB as HeritageItem[]).map((item) => [item.id, item]));

// Les 77 identifiants exacts des communes. Ils correspondent au champ `id`
// dans les fichiers JSON et s'écrivent toujours sans accents.
const communesWithAvailableImages = new Set([
  "abomey", "abomey-calavi", "adja-ouere", "adjara", "adjohoun",
  "agbangnizoun", "aguegues", "akpro-misserete", "allada", "aplahoue",
  "athieme", "avrankou", "banikoara", "bante", "bassila", "bembereke",
  "bohicon", "bonou", "bopa", "boukoumbe", "cobly", "come", "copargo",
  "cotonou", "cove", "dangbo", "dassa-zoume", "djakotomey", "djidja",
  "djougou", "dogbo", "glazoue", "gogounou", "grand-popo", "houeyogbe",
  "ifangni", "kalale", "kandi", "karimama", "kerou", "ketou", "klouekanme",
  "kouande", "kpomasse", "lalo", "lokossa", "malanville", "materi",
  "natitingou", "ndali", "nikki", "ouake", "ouassa-pehunco", "ouesse",
  "ouidah", "ouinhi", "parakou", "perere", "pobe", "porto-novo", "sakete",
  "savalou", "save", "segbana", "seme-podji", "sinende", "so-ava",
  "tanguieta", "tchaourou", "toffo", "tori-bossito", "toucountouna",
  "toviklin", "za-kpota", "zagnanado", "ze", "zogbodomey",
]);

function prepareItem(item: HeritageItem): HeritageItem {
  const descriptionHistoire = royalDetails[item.id as keyof typeof royalDetails];
  const enriched = descriptionHistoire ? { ...item, descriptionHistoire } : item;
  // Toute image ajoutée dans public/games est automatiquement reconnue.
  const hasLocalImage = enriched.imageUrl.startsWith("/games/");

  return enriched.type === "commune" && !hasLocalImage && !communesWithAvailableImages.has(enriched.id)
    ? { ...enriched, imagePending: true }
    : enriched;
}

// La liste de base garde les 77 communes et les fiches historiques initiales.
// Chaque fichier détaillé de data/ remplace automatiquement sa fiche de base.
const baseItems = (patrimoine as HeritageItem[]).map((item) =>
  prepareItem(detailsById.get(item.id) ?? seriesBDetails.get(item.id) ?? item),
);

// Artistes, rois, fêtes et toute nouvelle fiche absente de patrimoine.json.
const extraItems = catalogueDetails
  .filter((item) => !baseItems.some((baseItem) => baseItem.id === item.id))
  .map(prepareItem);

const heritageItems = [...baseItems, ...extraItems];

export function getAllHeritage(): HeritageItem[] {
  return heritageItems;
}

export function getHeritageById(id: string): HeritageItem | undefined {
  return heritageItems.find((item) => item.id === id);
}
