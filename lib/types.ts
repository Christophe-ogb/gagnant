export type HeritageType = "commune" | "divinite" | "roi" | "site" | "contemporain";

export type Quiz = {
  question: string;
  options: string[];
  reponseCorrecteIndex: number;
  explication: string;
  points: number;
};

export type HeritageScene = {
  titre: string;
  localisation: string;
  texte: string;
  imageUrl: string;
  imageAlt: string;
  imagePending?: boolean;
};

export type HeritagePlace = {
  id: string;
  nom: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

export type HeritageItem = {
  id: string;
  type: HeritageType;
  nom: string;
  sousTitre: string;
  communeAssociee: string;
  imageUrl: string;
  imageAlt: string;
  /** Masque les images provisoires en attendant les photos officielles. */
  imagePending?: boolean;
  descriptionHistoire: string;
  leSaviezVous: string;
  scenes?: HeritageScene[];
  lieuxAVisiter?: HeritagePlace[];
  challenge?: {
    badge: string;
    accroche: string;
    encouragement: string;
  };
  isReady?: boolean;
  quiz: Quiz | Quiz[];
};
