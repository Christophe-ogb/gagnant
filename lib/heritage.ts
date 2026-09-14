import patrimoine from "@/data/patrimoine.json";
import royalDetails from "@/data/royal-details.json";
import seriesB from "@/data/series-b.json";
import { catalogueDetails } from "@/data/catalogue-details";
import type { HeritageItem } from "@/lib/types";

const detailsById = new Map(catalogueDetails.map((item) => [item.id, item]));
const seriesBDetails = new Map((seriesB as HeritageItem[]).map((item) => [item.id, item]));

// Ces communes possèdent actuellement des visuels validés. Les autres fiches
// restent volontairement sans image jusqu'à l'ajout de leurs photos officielles.
const communesWithAvailableImages = new Set([
  "dangbo", "allada", "cotonou", "ganvie", "abomey", "ze", "ouidah",
  "natitingou", "porto-novo", "abomey-calavi",
]);

function prepareItem(item: HeritageItem): HeritageItem {
  const descriptionHistoire = royalDetails[item.id as keyof typeof royalDetails];
  const enriched = descriptionHistoire ? { ...item, descriptionHistoire } : item;

  return enriched.type === "commune" && !communesWithAvailableImages.has(enriched.id)
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
