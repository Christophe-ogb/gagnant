export type TourismOuting = { id: string; nom: string; description: string; type: string; activites: string[]; prixEntree: string | null; adresse: string; imageUrl: string | null; telephone: string | null; horaires: string | null; commune: string | null; departement: string };

export const tourismOutings: TourismOuting[] = [
  {
    "id": "597bec01-9087-463a-9dc2-439d183dbff5",
    "nom": "Centre Nautique de Grand-Popo",
    "description": "Une base de loisirs en bord d\u2019Atlantique pour les sports nautiques, la d\u00e9tente et les sorties entre amis.",
    "type": "sport_nautique",
    "activites": [
      "Kitesurf",
      "Surf",
      "Stand-up paddle",
      "Jet-ski",
      "Plong\u00e9e"
    ],
    "prixEntree": "5 000 \u2013 25 000 FCFA",
    "adresse": "Plage de Grand-Popo, bord Atlantique",
    "imageUrl": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/1f/67/88/grand-popo-beach-tranquility.jpg?w=1000&h=-1&s=1",
    "telephone": null,
    "horaires": null,
    "commune": null,
    "departement": "mono"
  },
  {
    "id": "0b62ac6a-80a6-4de3-9e2f-ac9d3e39e5f6",
    "nom": "Centre Songha\u00ef Parakou",
    "description": "Un espace agro-\u00e9cologique pour d\u00e9couvrir l\u2019agriculture durable, les ateliers pratiques et la gastronomie locale.",
    "type": "ferme_eco",
    "activites": [
      "Visite guid\u00e9e",
      "Atelier compost",
      "D\u00e9gustation",
      "H\u00e9bergement",
      "Restaurant"
    ],
    "prixEntree": "1 500 FCFA (visite)",
    "adresse": "Route de Tchaourou, Parakou",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Papayes_red_royal.jpg/3840px-Papayes_red_royal.jpg",
    "telephone": null,
    "horaires": null,
    "commune": "Parakou",
    "departement": "borgou"
  },
  {
    "id": "53187bc8-fd87-4060-8287-3b4f96707a88",
    "nom": "Chutes de Kota",
    "description": "Une aventure nature dans l\u2019Atacora, entre randonn\u00e9e, tyrolienne, escalade et panoramas.",
    "type": "parc_aventure",
    "activites": [
      "Chute",
      "Tyrolienne",
      "Randonn\u00e9e",
      "Escalade",
      "VTT"
    ],
    "prixEntree": "3 000 \u2013 8 000 FCFA",
    "adresse": "Cha\u00eene de l'Atakora, Natitingou",
    "imageUrl": "https://www.gouv.bj/upload/thumbnails/articles//0952356001605489551.jpeg",
    "telephone": null,
    "horaires": null,
    "commune": null,
    "departement": "atakora"
  },
  {
    "id": "849414e1-9a53-48dd-b550-9e2b18025931",
    "nom": "Ecolodge Club-Nature",
    "description": "Un lieu \u00e9coresponsable associant restauration, loisirs, nature et moments de d\u00e9tente.",
    "type": "ferme_eco",
    "activites": [
      "Aquarestaurant",
      "Aquad\u00e9tente",
      "jeux de soci\u00e9t\u00e9",
      "moments de relaxation en pleine nature"
    ],
    "prixEntree": "A partir de 5 000 FCFA",
    "adresse": "BP20 Z\u00e8 Akadjame, B\u00e9nin",
    "imageUrl": "https://mariage.bj/wp-content/uploads/2025/02/club-nature-5.jpg",
    "telephone": "+229 01 60 70 93 93",
    "horaires": null,
    "commune": "Abomey-Calavi",
    "departement": "atlantique"
  },
  {
    "id": "5aebcd12-e809-4328-a13c-d1f74ee8b7c5",
    "nom": "Family Beach",
    "description": "Un lieu convivial en bord de mer, adapt\u00e9 aux sorties en famille et aux repas partag\u00e9s.",
    "type": "autre",
    "activites": [
      "D\u00e9tente en famille",
      "Terrasse",
      "Salle \u00e0 manger priv\u00e9e"
    ],
    "prixEntree": "Gratuit",
    "adresse": "Fidjros\u00e9, Cotonou B\u00e9nin",
    "imageUrl": "https://d3fphkxyf5o5bm.cloudfront.net/image-resize/format=webp,w=1920/Q524tReNnAnmuqp47g1rJ6iMf2UTTcLxHVeEkdyGhk",
    "telephone": "+229 01 69 48 05 05",
    "horaires": "Tous les jours \u00e0 10h",
    "commune": "Cotonou",
    "departement": "littoral"
  },
  {
    "id": "a4c6c9df-1d90-4071-b2e3-e5593f307435",
    "nom": "Holy Land Parc",
    "description": "Un parc de loisirs avec jeux et restauration \u00e0 Abomey-Calavi.",
    "type": "parc_aventure",
    "activites": [
      "Jeux d'arcade",
      "Restaurant"
    ],
    "prixEntree": "2000 - 5000",
    "adresse": "Abomey Calavi, B\u00e9nin",
    "imageUrl": "https://beninmiton.com/wp-content/uploads/2023/08/368282921_673361511481361_4683708713877492266_n.jpg",
    "telephone": "+2290195869776",
    "horaires": "Lun - Dim 09h - 21h",
    "commune": "Abomey-Calavi",
    "departement": "atlantique"
  },
  {
    "id": "c851469c-44dd-4ac7-a600-44d9f66bfdb8",
    "nom": "\u00cele de Nokou\u00e9",
    "description": "Une exp\u00e9rience \u00e0 d\u00e9couvrir au B\u00e9nin.",
    "type": "ile_lac",
    "activites": [
      "Sprint boat",
      "P\u00e9dalo",
      "P\u00eache",
      "Baignade",
      "Pirogue"
    ],
    "prixEntree": "2 000 \u2013 10 000 FCFA",
    "adresse": "Embarcad\u00e8re de Cotonou, Lac Nokou\u00e9",
    "imageUrl": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/10/59/ea/ae/village.jpg?w=1000&h=-1&s=1",
    "telephone": null,
    "horaires": null,
    "commune": null,
    "departement": "littoral"
  },
  {
    "id": "4ca3a920-a754-48bd-b055-8a7646d69f4e",
    "nom": "Plage de Grand-Popo",
    "description": "Une plage paisible pour se promener, se d\u00e9tendre et profiter du littoral en famille ou entre amis.",
    "type": "ile_lac",
    "activites": [
      "Peche traditionnelle",
      "Natation",
      "Quad",
      "Football",
      "Equitation"
    ],
    "prixEntree": null,
    "adresse": "Grand-Popo",
    "imageUrl": "https://media-cdn.tripadvisor.com/media/photo-s/22/1f/67/87/caption.jpg",
    "telephone": null,
    "horaires": null,
    "commune": "Grand-Popo",
    "departement": "mono"
  },
  {
    "id": "76f5f0f0-e810-4f6e-a651-eab7e08ba9db",
    "nom": "Plage de Ouidah",
    "description": "Un espace naturel en bord d\u2019Atlantique, propice \u00e0 la d\u00e9tente et aux activit\u00e9s de plage.",
    "type": "ile_lac",
    "activites": [
      "Baignade",
      "Ski nautique",
      "Natation",
      "Quad",
      "Football",
      "Equitation",
      "Festivals"
    ],
    "prixEntree": null,
    "adresse": "Ouidah",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Beach_of_Ouidah_Benin.jpg",
    "telephone": null,
    "horaires": null,
    "commune": "Ouidah",
    "departement": "atlantique"
  },
  {
    "id": "81707404-a498-4c4a-bf89-5dbfb0f88da8",
    "nom": "Plage Erevan",
    "description": "Une plage de Cotonou pour profiter de l\u2019oc\u00e9an, des loisirs et des moments de d\u00e9tente.",
    "type": "ile_lac",
    "activites": [
      "Natation",
      "Quad",
      "football",
      "volleyball",
      "\u00e9quitation",
      "festivals"
    ],
    "prixEntree": null,
    "adresse": "Cadjehoun",
    "imageUrl": "https://cdn.tripinafrica.com/800x400/places/plage-erevan-3.jpg",
    "telephone": null,
    "horaires": null,
    "commune": "Cotonou",
    "departement": "littoral"
  },
  {
    "id": "f301cd33-5901-44c8-9182-9793be7b6bae",
    "nom": "R\u00e9serve Priv\u00e9e de Pendjari",
    "description": "Une exp\u00e9rience safari au contact de la faune et des paysages de la Pendjari.",
    "type": "zoo_safari",
    "activites": [
      "Safari",
      "Photo-safari",
      "Nuit en brousse",
      "Ornithologie",
      "Randonn\u00e9e"
    ],
    "prixEntree": "15 000 \u2013 50 000 FCFA",
    "adresse": "Zone tampon Pendjari, Tangui\u00e9ta",
    "imageUrl": null,
    "telephone": null,
    "horaires": null,
    "commune": null,
    "departement": "atakora"
  },
  {
    "id": "8c4a920b-7ff7-4593-8cf5-6e12daee16ad",
    "nom": "Riverside h\u00eavi\u00e9",
    "description": "Un lieu de d\u00e9tente au bord de l\u2019eau avec loisirs nautiques, restauration et h\u00e9bergement.",
    "type": "autre",
    "activites": [
      "P\u00e9dalo",
      "Kayak",
      "Speedboat"
    ],
    "prixEntree": "15000 - 25000",
    "adresse": "RiverSide Lodge, h\u00eavi\u00e9, B\u00e9nin",
    "imageUrl": "https://cf.bstatic.com/xdata/images/hotel/max1024x768/767501071.jpg?k=18f0c3df806649b2973120fdb4c9c05c325a0a5baddf1b84c92349a11bfdb1e9&o=",
    "telephone": "+229 01 67 52 22 77",
    "horaires": "24/7",
    "commune": "Cotonou",
    "departement": "littoral"
  },
  {
    "id": "32fa6538-cee3-4ea0-b96d-21846e6ba72c",
    "nom": "Spa Wellness Cotonou",
    "description": "Un espace bien-\u00eatre d\u00e9di\u00e9 aux massages, soins, hammam et moments de relaxation.",
    "type": "spa",
    "activites": [
      "Massage",
      "Hammam",
      "Soins visage",
      "Piscine",
      "Jacuzzi"
    ],
    "prixEntree": "5 000 \u2013 30 000 FCFA",
    "adresse": "99QR+69W, Cotonou, B\u00e9nin",
    "imageUrl": "https://www.wellnesshouse-spa.com/wp-content/uploads/2025/02/WhatsApp-Image-2025-02-13-a-14.48.03_405a2d4b.jpg",
    "telephone": "+229 01 61 00 31 85",
    "horaires": null,
    "commune": "Cotonou",
    "departement": "littoral"
  }
];
