import type { HeritageItem } from "@/lib/types";
import abomey from "@/data/abomey.json";
import abomeyCalavi from "@/data/abomey-calavi.json";
import adjaOuere from "@/data/adja-ouere.json";
import adjarra from "@/data/adjarra.json";
import adjohoun from "@/data/adjohoun.json";
import agbangnizoun from "@/data/agbangnizoun.json";
import aguegues from "@/data/aguegues.json";
import akproMisserete from "@/data/akpro-misserete.json";
import allada from "@/data/allada.json";
import angeliqueKidjo from "@/data/angelique-kidjo.json";
import aplahoue from "@/data/aplahoue.json";
import athieme from "@/data/athieme.json";
import avrankou from "@/data/avrankou.json";
import axelMerryl from "@/data/axel-merryl.json";
import banikoara from "@/data/banikoara.json";
import bante from "@/data/bante.json";
import bassila from "@/data/bassila.json";
import bembereke from "@/data/bembereke.json";
import bioGuerra from "@/data/bio-guerra.json";
import bohicon from "@/data/bohicon.json";
import bonou from "@/data/bonou.json";
import bopa from "@/data/bopa.json";
import boukoumbe from "@/data/boukoumbe.json";
import boniYayi from "@/data/boni-yayi.json";
import ciara from "@/data/ciara.json";
import cobly from "@/data/cobly.json";
import come from "@/data/come.json";
import copargo from "@/data/copargo.json";
import cotonou from "@/data/cotonou.json";
import cove from "@/data/cove.json";
import dangbo from "@/data/dangbo.json";
import dassaZoume from "@/data/dassa-zoume.json";
import djakotomey from "@/data/djakotomey.json";
import djidja from "@/data/djidja.json";
import djougou from "@/data/djougou.json";
import dogbo from "@/data/dogbo.json";
import fanicko from "@/data/fanicko.json";
import feteGaani from "@/data/fete-de-la-gaani.json";
import feteIgname from "@/data/fete-de-l-igname.json";
import feteTravail from "@/data/fete-du-travail.json";
import feteIndependance from "@/data/fete-nationale-independance.json";
import firstKing from "@/data/first-king.json";
import glazoue from "@/data/glazoue.json";
import gogounou from "@/data/gogounou.json";
import grandPopo from "@/data/grand-popo.json";
import houeyogbe from "@/data/houeyogbe.json";
import hubertMaga from "@/data/hubert-maga.json";
import ifangni from "@/data/ifangni.json";
import isidoreDeSouza from "@/data/isidore-de-souza.json";
import journeeVodun from "@/data/journee-mondiale-vodun.json";
import journeesPatrimoine from "@/data/journees-du-patrimoine-beninois.json";
import kalale from "@/data/kalale.json";
import kandi from "@/data/kandi.json";
import karimama from "@/data/karimama.json";
import kerou from "@/data/kerou.json";
import ketou from "@/data/ketou.json";
import klouekanme from "@/data/klouekanme.json";
import kouande from "@/data/kouande.json";
import kpomasse from "@/data/kpomasse.json";
import lalo from "@/data/lalo.json";
import lokossa from "@/data/lokossa.json";
import madara from "@/data/madara.json";
import malanville from "@/data/malanville.json";
import materi from "@/data/materi.json";
import mathieuKerekou from "@/data/mathieu-kerekou.json";
import natitingou from "@/data/natitingou.json";
import ndali from "@/data/ndali.json";
import nelOliver from "@/data/nel-oliver.json";
import nicephoreSoglo from "@/data/nicephore-soglo.json";
import nikki from "@/data/nikki.json";
import nonvitcha from "@/data/nonvitcha.json";
import ouake from "@/data/ouake.json";
import ouassaPehunco from "@/data/ouassa-pehunco.json";
import ouesse from "@/data/ouesse.json";
import ouidah from "@/data/ouidah.json";
import ouinhi from "@/data/ouinhi.json";
import parakou from "@/data/parakou.json";
import patriceTalon from "@/data/patrice-talon.json";
import perere from "@/data/perere.json";
import pipiWobaho from "@/data/pipi-wobaho.json";
import pobe from "@/data/pobe.json";
import portoNovo from "@/data/porto-novo.json";
import richardFlash from "@/data/richard-flash.json";
import romualdWadagni from "@/data/romuald-wadagni.json";
import roiAkemasse from "@/data/roi-akemasse.json";
import roiAladeIfe from "@/data/roi-alade-ife.json";
import roiGbaguidi from "@/data/roi-gbaguidi-1.json";
import roiKpasse from "@/data/roi-kpasse.json";
import sakete from "@/data/sakete.json";
import savalou from "@/data/savalou.json";
import save from "@/data/save.json";
import segbana from "@/data/segbana.json";
import semePodji from "@/data/seme-podji.json";
import seriKpera from "@/data/seri-kpera-2.json";
import sessime from "@/data/sessime.json";
import sinende from "@/data/sinende.json";
import soAva from "@/data/so-ava.json";
import tanguieta from "@/data/tanguieta.json";
import tchaourou from "@/data/tchaourou.json";
import tegbessou from "@/data/tegbessou.json";
import toffo from "@/data/toffo.json";
import toriBossito from "@/data/tori-bossito.json";
import toucountouna from "@/data/toucountouna.json";
import toviklin from "@/data/toviklin.json";
import vanoBaby from "@/data/vano-baby.json";
import zaKpota from "@/data/za-kpota.json";
import zagnanado from "@/data/zagnanado.json";
import ze from "@/data/ze.json";
import zeynab from "@/data/zeynab.json";
import zogbodomey from "@/data/zogbodomey.json";

// Toute nouvelle fiche doit uniquement être ajoutée à data/ puis importée ici.
export const catalogueDetails: HeritageItem[] = [
  abomey, abomeyCalavi, adjaOuere, adjarra, adjohoun, agbangnizoun, aguegues,
  akproMisserete, allada, angeliqueKidjo, aplahoue, athieme, avrankou, axelMerryl,
  banikoara, bante, bassila, bembereke, bioGuerra, bohicon, bonou, bopa, boukoumbe,
  boniYayi, ciara, cobly, come, copargo, cotonou, cove, dangbo, dassaZoume, djakotomey,
  djidja, djougou, dogbo, fanicko,
  feteGaani, feteIgname, feteTravail, feteIndependance, firstKing, glazoue,
  gogounou, grandPopo, houeyogbe, hubertMaga, ifangni, isidoreDeSouza,
  journeeVodun, journeesPatrimoine, kalale, kandi, karimama, kerou, ketou, klouekanme,
  kouande, kpomasse, lalo, lokossa, madara, malanville, materi, mathieuKerekou,
  natitingou, ndali, nelOliver, nicephoreSoglo, nikki, nonvitcha, ouake, ouassaPehunco,
  ouesse, ouidah, ouinhi, parakou, patriceTalon, perere, pipiWobaho, pobe, portoNovo,
  richardFlash, romualdWadagni, roiAkemasse, roiAladeIfe, roiGbaguidi, roiKpasse, sakete,
  savalou, save, segbana, semePodji, seriKpera, sessime, sinende, soAva,
  tanguieta, tchaourou, tegbessou, toffo, toriBossito, toucountouna, toviklin,
  vanoBaby, zaKpota, zagnanado, ze, zeynab, zogbodomey,
] as HeritageItem[];
