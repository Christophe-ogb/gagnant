import patrimoine from "@/data/patrimoine.json";
import adjaOuere from "@/data/adja-ouere.json";
import adjarra from "@/data/adjarra.json";
import adjohoun from "@/data/adjohoun.json";
import agbangnizoun from "@/data/agbangnizoun.json";
import aguegues from "@/data/aguegues.json";
import akproMisserete from "@/data/akpro-misserete.json";
import allada from "@/data/allada.json";
import aplahoue from "@/data/aplahoue.json";
import athieme from "@/data/athieme.json";
import avrankou from "@/data/avrankou.json";
import banikoara from "@/data/banikoara.json";
import bante from "@/data/bante.json";
import bassila from "@/data/bassila.json";
import bembereke from "@/data/bembereke.json";
import bohicon from "@/data/bohicon.json";
import seriesB from "@/data/series-b.json";
import dangbo from "@/data/dangbo.json";
import dassaZoume from "@/data/dassa-zoume.json";
import djakotomey from "@/data/djakotomey.json";
import djidja from "@/data/djidja.json";
import djougou from "@/data/djougou.json";
import dogbo from "@/data/dogbo.json";

import boniYayi from "@/data/boni-yayi.json";
import hubertMaga from "@/data/hubert-maga.json";
import isidoreDeSouza from "@/data/isidore-de-souza.json";
import mathieuKerekou from "@/data/mathieu-kerekou.json";
import nicephoreSoglo from "@/data/nicephore-soglo.json";
import patriceTalon from "@/data/patrice-talon.json";
import portoNovo from "@/data/porto-novo.json";
import royalDetails from "@/data/royal-details.json";
import tegbessou from "@/data/tegbessou.json";
import type { HeritageItem } from "@/lib/types";

const contemporaryDetails: Record<string, HeritageItem> = {
  "hubert-maga": hubertMaga as HeritageItem,
  "mathieu-kerekou": mathieuKerekou as HeritageItem,
  "nicéphore-soglo": nicephoreSoglo as HeritageItem,
  "isidore-de-souza": isidoreDeSouza as HeritageItem,
  "thomas-boni-yayi": boniYayi as HeritageItem,
  "patrice-talon": patriceTalon as HeritageItem,
};

const seriesBDetails = Object.fromEntries(
  (seriesB as HeritageItem[]).map((item) => [item.id, item]),
) as Record<string, HeritageItem>;

const fullTextDetails: Record<string, HeritageItem> = {
  dangbo: dangbo as HeritageItem,
  "dassa-zoume": dassaZoume as HeritageItem,
  djakotomey: djakotomey as HeritageItem,
  djidja: djidja as HeritageItem,
  djougou: djougou as HeritageItem,
  dogbo: dogbo as HeritageItem,

};

const heritageItems = (patrimoine as HeritageItem[]).map((item) => {
  const source = item.id === "tegbessou" ? tegbessou as HeritageItem : item.id === "porto-novo" ? portoNovo as HeritageItem : item.id === "adja-ouere" ? adjaOuere as HeritageItem : item.id === "adjara" ? adjarra as HeritageItem : item.id === "adjohoun" ? adjohoun as HeritageItem : item.id === "agbangnizoun" ? agbangnizoun as HeritageItem : item.id === "aguegues" ? aguegues as HeritageItem : item.id === "akpro-misserete" ? akproMisserete as HeritageItem : item.id === "allada" ? allada as HeritageItem : item.id === "aplahoue" ? aplahoue as HeritageItem : item.id === "athieme" ? athieme as HeritageItem : item.id === "avrankou" ? avrankou as HeritageItem : item.id === "banikoara" ? banikoara as HeritageItem : item.id === "bante" ? bante as HeritageItem : item.id === "bassila" ? bassila as HeritageItem : item.id === "bembereke" ? bembereke as HeritageItem : item.id === "bohicon" ? bohicon as HeritageItem : item.id === "boukoumbe" ? { ...seriesBDetails.boukombe, id: item.id } : fullTextDetails[item.id] ?? seriesBDetails[item.id] ?? contemporaryDetails[item.id] ?? item;
  const descriptionHistoire = royalDetails[source.id as keyof typeof royalDetails];
  return descriptionHistoire ? { ...source, descriptionHistoire } : source;
});

export function getAllHeritage(): HeritageItem[] {
  return heritageItems;
}

export function getHeritageById(id: string): HeritageItem | undefined {
  return heritageItems.find((item) => item.id === id);
}
