# Jeux Gagnants — MVP Vodun Days

> Feuille de route de construction — à suivre étape par étape.

## 1. Vision du projet

**Jeux Gagnants** prolonge le jeu physique béninois par une expérience mobile : un joueur scanne un QR code présent sur un plateau, une carte ou un support culturel ; il découvre un lieu, un roi, un héros ou une divinité, puis répond à un quiz pour gagner des points et débloquer des badges.

Le MVP destiné aux **Vodun Days** doit faire ressentir trois choses dès les premières secondes : la richesse du patrimoine béninois, le plaisir du jeu et le caractère premium de l’expérience. Le site n’est pas encore un jeu de plateau numérique complet : c’est une démonstration interactive, fluide et mémorable du pont entre le plateau physique et le contenu culturel.

Les références visuelles transmises serviront de base : le logo Gagnants, le plateau coloré, les cartes de communes et les scènes de jeu réelles. L’identité numérique sera plus immersive, avec une direction sombre, terreuse, dorée et contemporaine.

## 2. Cadre du MVP

### Inclus

- Accueil immersif, mobile-first.
- Simulation de scan QR code menant vers une fiche patrimoine.
- Fiches pour Ouidah, le roi Béhanzin, Sègbo Lissa, Ganvié et Kétou.
- Un quiz par fiche.
- Points, badges et découvertes sauvegardés dans le navigateur.
- Retours visuels de réussite : halo, animation, confettis dorés et état débloqué.
- Grille d’exploration du Bénin inspirée des communes et cartes physiques.

### Hors périmètre de la première version

- Connexion utilisateur, compte, classement en ligne ou paiement.
- Base de données, API ou serveur métier.
- Vrai lecteur de QR code par caméra : le bouton de simulation démontre le parcours. Le vrai scan viendra ensuite.
- Ludo, dames ou échecs jouables en ligne : ils apparaîtront d’abord comme extensions de l’univers Gagnants.

## 3. Stack déjà installée

| Outil | Rôle dans Jeux Gagnants |
| --- | --- |
| `next` 16.3.2 | Framework principal : pages, routes telles que `/scan/ouidah` et application performante. |
| `react` / `react-dom` 19.2.8 | Composants interactifs : quiz, cartes, compteurs et badges. |
| `typescript` | Sécurise les données culturelles et composants ; le projet utilisera `.tsx` et `.ts`. |
| `tailwindcss` 4 | Mise en page responsive, couleurs, effets de verre et états mobiles. |
| `@tailwindcss/postcss` | Relie Tailwind au processus de styles ; déjà configuré. |
| `framer-motion` | Animations premium : ouverture de fiche, halo, transitions et secousse d’erreur. |
| `canvas-confetti` | Confettis dorés lorsqu’une réponse est correcte. |
| `lucide-react` | Icônes légères : QR code, trophée, carte, étoile, cadenas, etc. |
| `clsx` | Assemble les classes conditionnelles : réponse vraie, fausse ou neutre. |
| `tailwind-merge` | Évite les conflits de classes Tailwind dans les composants à variantes. |
| `eslint` + `eslint-config-next` | Vérifie la qualité et les bonnes pratiques Next.js. |

Les dépendances essentielles demandées sont déjà présentes : aucun package additionnel n’est requis pour commencer.

## 4. Décisions techniques à respecter

1. **App Router.** Les pages vivent dans `app/`. Une fiche utilise `app/scan/[id]/page.tsx` ; par exemple, Ouidah ouvre `/scan/ouidah`.
2. **TypeScript.** Le projet de départ est TypeScript : nous conserverons `.tsx`/`.ts`, même si le brief mentionne `page.js`.
3. **Serveur par défaut, client seulement où nécessaire.** Les clics, animations, confettis et `localStorage` vivent dans des composants avec `'use client'`.
4. **Persistance locale seulement.** `localStorage` est lu après montage du composant, jamais pendant le rendu serveur.
5. **Images.** Utiliser `<img>`, jamais `next/image`, pour accepter les URLs externes sans config de domaine.
6. **Données locales.** Le contenu vit dans `data/patrimoine.json` : facile à modifier, versionné avec le site, sans API ni secret.
7. **Tailwind 4.** Les tokens sont définis dans `app/globals.css` via `@theme`. Dans ce projet, `tailwind.config.js` n’est pas nécessaire ; on ne l’ajoutera que si un besoin futur le justifie.

## 5. Direction artistique

| Usage | Couleur | Intention |
| --- | --- | --- |
| Fond | `#1A120B` | Terre sombre, profondeur, mystère. |
| Cartes | `#2B1E16` | Conteneur chaud et élégant. |
| Or royal | `#D4AF37` | Récompense, prestige, accent majeur. |
| Bronze | `#C5A059` | Variation d’or et détails. |
| Rouge latérite | `#A83232` | Énergie, célébration, erreur contrôlée. |
| Texte kaolin | `#F4F1EA` | Lecture douce sur fond sombre. |

- `Cinzel` : titres, noms de souverains, badges et moments cérémoniels.
- `Plus Jakarta Sans` : textes, boutons, navigation et quiz.
- Les polices seront chargées dans `app/layout.tsx` avec `next/font/google` : elles sont servies avec l’application, sans requête Google du navigateur.
- Cible prioritaire : écran 360–430 px ; zones tactiles d’au moins 44 px ; une action principale par écran.
- Les animations doivent soutenir le récit, rester courtes (150–300 ms) et respecter `prefers-reduced-motion`.

## 6. Architecture cible

```text
gagnant_project/
├─ app/
│  ├─ globals.css                  # Tokens, styles globaux, effets de fond
│  ├─ layout.tsx                   # Métadonnées, polices, structure racine
│  ├─ page.tsx                     # Accueil
│  └─ scan/[id]/page.tsx           # Fiche patrimoine dynamique
├─ components/
│  ├─ brand-logo.tsx
│  ├─ player-progress.tsx
│  ├─ hero.tsx
│  ├─ exploration-grid.tsx
│  ├─ badge-gallery.tsx
│  ├─ heritage-hero-card.tsx
│  ├─ quiz-card.tsx
│  └─ ui/
│     ├─ button.tsx
│     └─ glass-card.tsx
├─ data/patrimoine.json            # Contenus statiques
├─ lib/
│  ├─ heritage.ts                  # Lecture/recherche des données
│  ├─ progress.ts                  # Contrat localStorage
│  ├─ cn.ts                        # clsx + tailwind-merge
│  └─ types.ts                     # Types métier
└─ public/
   ├─ brand/                       # Logo validé
   └─ textures/                    # Textures légères éventuelles
```

## 7. Contrat de données

`data/patrimoine.json` contiendra un tableau. Les `id` doivent être stables, minuscules, sans espace et utilisables dans une URL.

```json
{
  "id": "ouidah",
  "type": "commune",
  "nom": "Ouidah",
  "sousTitre": "Au carrefour des mémoires, des rites et de l’océan",
  "communeAssociee": "Ouidah",
  "imageUrl": "https://...",
  "descriptionHistoire": "Texte relu, sourcé et immersif...",
  "leSaviezVous": "Une information courte et vérifiée...",
  "quiz": {
    "question": "... ?",
    "options": ["...", "...", "...", "..."],
    "reponseCorrecteIndex": 0,
    "explication": "Pourquoi cette réponse est juste.",
    "points": 100
  }
}
```

Règle éditoriale : ne pas inventer les faits historiques. Chaque image doit être libre d’utilisation ou autorisée ; conserver auteur, licence et URL source dans un registre éditorial.

## 8. Contrat de progression locale

Clé : `jeux-gagnants:progress:v1`.

```ts
type PlayerProgress = {
  points: number
  completedQuizIds: string[]
  unlockedHeritageIds: string[]
  unlockedBadgeIds: string[]
}
```

- Première visite : progression à zéro.
- Bonne réponse : points ajoutés une seule fois, fiche et badge débloqués.
- Mauvaise réponse : aucun retrait, réessai immédiat.
- Fiche déjà réussie : état obtenu, sans doubler les points ni rejouer les confettis.
- Prévoir ensuite une réinitialisation confirmée, utile entre deux démonstrations.

## 9. Parcours de démonstration

```text
Accueil → « Simuler un Scan QR Code » → fiche
→ /scan/[id] → histoire → quiz → bonne réponse
→ confettis + points + badge + zone déverrouillée → accueil
```

Le simulateur ouvrira une liste contrôlée de cinq fiches. Plus tard, les QR imprimés pourront pointer directement vers une URL comme `https://domaine.bj/scan/ouidah`.

## 10. Plan d’exécution

### Étape 0 — Cadrage éditorial

**But :** sécuriser le contenu avant tout code.

**Statut : en cours.** Les trois dossiers transmis ont été analysés comme sources de contexte produit et éditorial. Ils confirment que le site est le compagnon numérique des jeux physiques, avec la boucle centrale : **jouer → scanner → découvrir → répondre → collectionner**. Ils ne remplacent pas la vérification historique, des droits d’images ou des informations sensibles avant publication.

#### Décisions prises pour le front MVP

| Sujet | Décision de départ |
| --- | --- |
| Promesse | « Et si on jouait notre histoire ? » : faire découvrir le Bénin par le jeu. |
| Jeux physiques mis en avant | Dames des 77 Communes, Ludo des Royaumes, Cartes du Bénin. |
| Point d’entrée numérique | QR code du plateau, d’une carte ou d’un jeu, menant à `/scan/[id]`. |
| Gamification | Points, découvertes et badges conservés sur le téléphone, sans compte pour le MVP. |
| Première démo | Cinq fiches solides, plutôt que 77 communes incomplètes. |
| Extension prévue | « Mon Bénin » : progression de découverte des 77 communes, après validation du MVP. |

#### Lot éditorial initial à produire

| ID | Fiche | Type technique | Rôle dans la démo | Validation nécessaire |
| --- | --- | --- | --- | --- |
| `ouidah` | Ouidah | `commune` | Entrée Vodun Days et patrimoine vivant. | Texte, image, quiz et sources. |
| `behanzin` | Roi Béhanzin | `roi` | Histoire, royauté et résistance. | Chronologie, image et formulation historienne. |
| `segbo-lissa` | Sègbo Lissa | `divinite` | Dimension spirituelle à traiter avec respect. | Validation culturelle renforcée, vocabulaire et illustration adaptée. |
| `ganvie` | Ganvié (commune associée : Sô-Ava) | `commune` | Patrimoine lacustre et porte d’entrée touristique. | Clarifier la dénomination et la fiche territoriale. |
| `ketou` | Kétou | `commune` | Royaume, territoire et continuité culturelle. | Angle narratif, image et quiz vérifiés. |

> Note de modélisation : le schéma demandé ne contient que `commune`, `divinite` et `roi`. Ganvié sera donc temporairement affiché comme une fiche `commune` avec `communeAssociee: "Sô-Ava"`. Lorsque l’on enrichira le modèle, on pourra ajouter le type `lieu` sans casser les URLs actuelles.

#### Registre de validation à compléter avant l’étape 2

Pour chacune des cinq fiches, consigner dans le README ou un registre éditorial :

- une source institutionnelle, patrimoniale, universitaire ou musée ;
- l’URL de la page source et la date de consultation ;
- une reformulation courte adaptée au mobile, jamais une copie longue ;
- l’auteur, la licence et l’URL de l’image ;
- la question, les quatre réponses et la justification de la bonne réponse ;
- le nom du badge et les points attribués ;
- le nom de la personne ou structure ayant validé les contenus spirituels/culturels lorsqu’une validation est nécessaire.

- Valider les cinq fiches et leur angle narratif.
- Identifier l’usage de chaque image transmise : logo, inspiration, photo à intégrer ou référence documentaire.
- Réunir les sources historiques et droits d’images.
- Définir les identifiants des QR de démonstration et les badges associés.

**Livrable :** liste validée : fiche, source, image, quiz, URL QR et badge.

**Passage :** aucune fiche ne manque de source ou d’image autorisée.

### Étape 1 — Fondation visuelle et technique

**But :** installer l’univers Gagnants dans le starter Next.js.

**Statut : terminée pour la première version.** Le thème Tailwind 4, les polices Cinzel / Plus Jakarta Sans, le fond mystique et l’accueil responsive sont codés.

- Mettre à jour `app/layout.tsx` : `lang="fr"`, métadonnées, Cinzel et Plus Jakarta Sans.
- Créer les tokens dans `app/globals.css` : palette, fond mystique, sélection et animations réduites.
- Créer `Button`, `GlassCard` et `cn`.
- Déposer le logo optimisé dans `public/brand/` une fois l’usage confirmé.
- Vérifier contraste et ergonomie sur 360 px.

**Livrable :** base visuelle sans logique métier.

**Passage :** `npm run lint` passe et la base est lisible sur mobile.

### Étape 2 — Données et types

**But :** alimenter tout le MVP avec un contenu local fiable.

**Statut : terminée pour la démonstration.** `data/patrimoine.json`, les types et le lecteur de fiches sont en place. Les contenus restent à faire valider éditorialement avant publication publique.

- Créer les cinq entrées de `data/patrimoine.json`.
- Créer `lib/types.ts` et `lib/heritage.ts`.
- Prévoir un affichage propre si un `id` est introuvable.
- Vérifier les IDs, URLs et indices de réponses.

**Livrable :** données typées et accessibles par `id`.

**Passage :** aucun quiz n’a d’index de réponse invalide.

### Étape 3 — Progression locale

**But :** rendre les découvertes persistantes sur le téléphone du jury.

**Statut : terminée pour les points, quizzes et badges.** La clé `jeux-gagnants:progress:v1` conserve une réussite sans jamais doubler les points.

- Créer `lib/progress.ts` : valeur initiale, lecture sûre, écriture et réussite.
- Créer le composant client de compteur de points et badges.
- Tester après actualisation et sur une fiche déjà réussie.

**Livrable :** points, badges et déblocages en `localStorage`.

**Passage :** une réussite ne double jamais les points après rechargement.

### Étape 4 — Accueil immersif

**But :** faire comprendre le concept en moins de dix secondes.

**Statut : première version terminée.** Le simulateur complet et la galerie de badges détaillée restent à ajouter lors du polissage.

- Header compact : logo, points animés, nombre de badges.
- Hero : promesse forte, contexte court, bouton « Simuler un Scan QR Code ».
- Grille d’exploration d’abord, plutôt qu’une carte SVG complexe : verrouillé sombre, disponible bronze, débloqué doré.
- Galerie « Mes badges débloqués » avec un élégant état vide.

**Livrable :** page `/` responsive.

**Passage :** le jury sait immédiatement où cliquer et voit sa progression.

### Étape 5 — Fiche scan dynamique

**But :** faire du scan un moment spectaculaire et utile.

**Statut : première version terminée.** Les routes `/scan/ouidah`, `/scan/behanzin`, `/scan/segbo-lissa`, `/scan/ganvie` et `/scan/ketou` sont générées à partir des données locales.

- Créer `app/scan/[id]/page.tsx`.
- Lire les paramètres de route de façon compatible Next.js 16 : ils sont asynchrones dans une page serveur.
- Afficher Hero Card : `<img>`, dégradé sombre, type, nom Cinzel et sous-titre.
- Ajouter narration, « Le saviez-vous ? » et retour à l’exploration.
- Isoler les interactions dans des composants client.

**Livrable :** `/scan/ouidah` et les quatre autres URLs.

**Passage :** une URL erronée ne casse pas le site et une fiche est impeccable sur mobile.

### Étape 6 — Quiz, récompense et micro-interactions

**But :** créer le « Waouh » du MVP.

**Statut : première version terminée.** Le quiz gère le succès, l’échec, le nouvel essai, les confettis, les points et l’état déjà gagné.

- Créer `QuizCard` : états initial, sélection, erreur et succès.
- Mauvaise réponse : secousse courte, encouragement, réessai.
- Bonne réponse : bordure verte, explication, confettis dorés, mise à jour de la progression.
- Animer l’ouverture : montée douce, rotation légère et halo doré, sans bloquer la lecture.
- Ajouter `hover` en complément du tactile et `active:scale-95` aux boutons.

**Livrable :** boucle complète du quiz à la récompense persistante.

**Passage :** bonne réponse = animation + persistance + accueil mis à jour ; mauvaise réponse = réessai sans point.

### Étape 7 — Finition audition

**But :** fiabiliser la présentation sur le terrain.

- Tester sur Android et iPhone, y compris réseau lent.
- Optimiser les assets lourds tout en conservant les balises `<img>`.
- Vérifier clavier, contraste, tailles de texte, liens et cibles tactiles.
- Préparer les QR physiques et la réinitialisation de progression du présentateur.
- Exécuter `npm run lint` puis `npm run build`.

**Livrable :** démo stable, répétable et prête à présenter.

**Passage :** parcours complet validé plusieurs fois sur téléphone réel.

## 11. Détail complet des écrans à finaliser

Cette section est la définition de fini du front-end. Aucun écran ne doit être considéré terminé tant que ses états ci-dessous ne sont pas visibles et testés.

### 11.1 Écran de chargement initial

- Afficher le fond terre sombre, le logo et un halo doré discret pendant le chargement des composants client.
- Ne pas bloquer plus longtemps que nécessaire : le contenu statique doit apparaître immédiatement.
- Prévoir un état sans JavaScript : les textes de la page et les liens de fiches restent accessibles ; seuls points, animation et quiz deviennent inactifs.

### 11.2 Header global

- Logo cliquable qui retourne à l’accueil, avec alternative textuelle `Jeux Gagnants`.
- Pastille « points » avec icône trophée et animation très courte quand le total change.
- Pastille « badges » avec nombre débloqué sur le total disponible.
- En mobile : logo à gauche, indicateurs compacts à droite ; aucune ligne ne doit déborder.
- En desktop : même information, mais espacements et taille légèrement augmentés.

### 11.3 Accueil : Hero

- Eyebrow : `Vodun Days • Bénin`.
- Titre Cinzel court et percutant, sur 2 à 4 lignes maximum sur mobile.
- Texte explicatif : scanner, découvrir, répondre et gagner.
- Bouton primaire : `Simuler un Scan QR Code`, avec icône QR code.
- Bouton secondaire : `Explorer le Bénin`, ancre vers la grille.
- Visuel de plateau/carte ou composition culturelle, en arrière-plan décoratif seulement : la lisibilité du texte prime.
- Sous le bouton, afficher une phrase rassurante : `Aucune inscription requise`.

### 11.4 Simulateur de scan

- À l’ouverture, présenter une feuille/modale basse sur mobile, avec fond assombri et fermeture accessible.
- Afficher les cinq contenus de démo sous forme de liste courte : image, nom, type et flèche.
- Un clic ouvre précisément `/scan/[id]`.
- Gérer fermeture par bouton, clic sur fond et touche Échap.
- Garder le focus clavier dans la modale tant qu’elle est ouverte et le rendre au bouton à la fermeture.

### 11.5 Grille « Explorer le Bénin »

- Titre, explication courte et compteur `x / 5 découvertes`.
- Chaque carte affiche image, nom, type et statut.
- **Verrouillée :** image assombrie, cadenas, texte « À découvrir par scan » ; elle ne doit pas faire croire qu’elle est déjà gagnée.
- **Disponible :** lien ou carte cliquable mise en avant pour la démo, si ce comportement est retenu.
- **Débloquée :** bordure dorée, coche/étoile et date ou mention « Découverte ».
- Les cartes ont un ordre éditorial choisi (et non aléatoire) pour guider la narration de la démonstration.
- Sur mobile : une colonne ou deux selon la largeur ; sur desktop : 3 à 5 colonnes sans réduire la lisibilité.

### 11.6 Galerie de badges

- État vide : silhouette de trophée, texte motivant, pas de zone blanche vide.
- État obtenu : nom, icône, couleur du badge et référence de la fiche gagnée.
- Les badges non obtenus peuvent être affichés comme silhouettes, mais sans révéler inutilement toute la réponse du quiz.
- Prévoir une animation d’entrée uniquement pour le dernier badge obtenu.

### 11.7 Page scan : introduction animée

- Entrée de la fiche avec `framer-motion` : opacité, translation verticale légère et halo doré ; aucune rotation spectaculaire qui nuirait aux performances mobiles.
- Le titre et le CTA restent visibles sans avoir à attendre la fin d’une animation.
- Désactiver ou simplifier cette animation si l’utilisateur demande moins de mouvements.

### 11.8 Page scan : Hero Card

- Image affichée avec `<img>`, `alt` descriptif et fallback visuel si l’URL échoue.
- Dégradé sombre bas vers haut pour préserver contraste du titre.
- Badge de type : `Commune`, `Roi` ou `Divinité` ; le type est un texte, pas une couleur seule.
- Nom en Cinzel, sous-titre, et mention de commune associée.
- Bouton retour à l’exploration, visible et accessible.

### 11.9 Page scan : narration

- Section « L’histoire » : paragraphes courts, lignes confortables, aucun mur de texte.
- Section « Le saviez-vous ? » : carte différente, icône ampoule/étoile, accent bronze.
- Ne pas utiliser de carrousel ; le scroll vertical est plus fiable pour la démo mobile.
- Si une source publique est affichée, elle doit être clairement distinguée du texte de narration.

### 11.10 Page scan : quiz

- Afficher progression `Défi patrimoine`, question et nombre de points à gagner avant le choix.
- Quatre choix au maximum, chacun sous forme de bouton entier, numéroté ou marqué A/B/C/D pour la lisibilité.
- État neutre, pressé, sélectionné, correct, incorrect et désactivé : chacun doit être discernable sans dépendre uniquement de la couleur.
- Bonne réponse : empêcher le second clic, persister le gain, déclencher les confettis une fois, afficher l’explication et un bouton « Continuer l’exploration ».
- Mauvaise réponse : secousse limitée au bloc quiz, message encourageant, bouton/possibilité claire de réessayer ; aucune pénalité.
- Quiz déjà validé : montrer score gagné, explication et badge ; ne plus proposer de gagner les mêmes points.

### 11.11 États d’erreur et cas limites

- `id` de scan inconnu : page 404 culturelle avec retour accueil, sans message technique.
- JSON invalide ou fiche incomplète : afficher une carte « contenu bientôt disponible », journaliser seulement en développement.
- Image indisponible : fond texturé, nom de la fiche et aucune icône cassée.
- `localStorage` inaccessible : l’expérience fonctionne dans la session, avec un message discret indiquant que la progression ne pourra pas être conservée.
- Aucun contenu débloqué : la galerie et la grille ont des états vides intentionnels.

## 12. Ordre précis de construction des fichiers

Construire dans cet ordre afin de limiter les retours en arrière :

1. `lib/types.ts` : schémas TypeScript des fiches, quiz, badges et progression.
2. `data/patrimoine.json` : cinq fiches complètes, vérifiées et ordonnées.
3. `lib/heritage.ts` : lecture des données, recherche par `id`, liste des fiches ; cas introuvable.
4. `lib/cn.ts` : fonction de fusion de classes.
5. `lib/progress.ts` : constante de clé, valeur initiale, lecture, écriture, ajout idempotent de réussite, reset.
6. `app/layout.tsx` : langue, polices, métadonnées et structure générale.
7. `app/globals.css` : `@theme`, fond, focus visible, sélection, réduction de mouvement, utilitaires de verre et d’or.
8. `components/ui/button.tsx` et `components/ui/glass-card.tsx` : variantes primaire, secondaire, fantôme, succès et erreur.
9. `components/brand-logo.tsx` et `components/player-progress.tsx`.
10. `components/scan-simulator.tsx`, `components/hero.tsx`, `components/exploration-grid.tsx`, `components/badge-gallery.tsx`.
11. `app/page.tsx` : composer l’accueil avec données et composants.
12. `components/heritage-hero-card.tsx` et `components/heritage-story.tsx`.
13. `components/quiz-card.tsx` : états, accessibilité, confettis, persistance et redirection.
14. `app/scan/[id]/page.tsx` : lecture du paramètre, recherche, rendu de la fiche ou état introuvable.
15. `app/not-found.tsx`, `app/loading.tsx` et, si utile, `app/error.tsx` pour les états globaux de navigation.
16. Polissage final : responsive, animation, poids des images, SEO, tests manuels et build.

## 13. Système de composants et règles d’implémentation

| Élément | Responsabilité | Client ? |
| --- | --- | --- |
| `BrandLogo` | Affichage du logo, lien accueil, alternative textuelle. | Non |
| `PlayerProgress` | Lire et afficher les points/badges mis à jour. | Oui |
| `ScanSimulator` | Modale, navigation, focus et fermeture. | Oui |
| `ExplorationGrid` | États verrouillé/débloqué à partir des données et progression. | Oui |
| `BadgeGallery` | Affichage des badges et états vides. | Oui |
| `HeritageHeroCard` | Image, titre, type, sous-titre. | Non |
| `HeritageStory` | Narration et fait marquant. | Non |
| `QuizCard` | Réponses, animation, confettis et écriture locale. | Oui |
| `Button` / `GlassCard` | Style réutilisable ; aucune logique métier. | Non, sauf besoin d’événement parent |

Règles : une donnée reste dans `data/` ou `lib/`; un composant ne duplique pas le contenu. Les composants interactifs reçoivent des props sérialisables. Les classes Tailwind complexes passent par `cn()` pour éviter les collisions.

## 14. Responsive, accessibilité et performance

### Responsive

- Référence : 360 px, 390 px, 430 px, 768 px, 1024 px et 1440 px.
- Aucun défilement horizontal ; titres et mots longs ne doivent pas sortir de l’écran.
- Conteneur central avec largeur maximale sur desktop, marges horizontales généreuses et sections respirantes.
- Image Hero : hauteur contrôlée, recadrage avec `object-cover`, sans déformer le contenu culturel.
- Menu/modal, badges et boutons restent utilisables en portrait comme en paysage.

### Accessibilité

- Utiliser les balises sémantiques : `header`, `main`, `section`, `article`, `nav`, `button` et titres ordonnés.
- Tous les boutons ont un libellé clair ; les icônes seules ont `aria-label`.
- Focus clavier très visible en or/kaolin ; ne jamais supprimer `outline` sans alternative.
- Contraste minimum lisible ; l’état correct/incorrect inclut texte et icône, pas seulement vert/rouge.
- Les confettis sont décoratifs : ne pas les annoncer en boucle aux lecteurs d’écran ; le succès est annoncé dans une zone `aria-live` concise.
- La modale de scan doit capturer le focus et se fermer au clavier.

### Performance

- Limiter à une image principale par écran ; images JPEG/WebP compressées quand elles sont sous contrôle du projet.
- Pour les images externes, prévoir dimensions ou ratio CSS afin d’éviter les sauts de mise en page.
- Importer `canvas-confetti` uniquement dans le composant client de quiz.
- Animer `opacity` et `transform`, jamais des propriétés coûteuses en continu.
- Éviter vidéo, carrousel automatique et texture lourde dans ce MVP.
- Vérifier que la page reste fluide sur un smartphone Android milieu de gamme.

## 15. Checklist de recette front-end

### Fonctionnelle

- [ ] L’accueil charge sans erreur.
- [ ] Le simulateur ouvre, se ferme et chaque choix ouvre la bonne fiche.
- [ ] Les cinq URLs `/scan/[id]` affichent le bon contenu.
- [ ] Une URL inexistante présente un retour propre.
- [ ] Une réponse vraie ajoute les points une seule fois.
- [ ] Une réponse fausse permet de rejouer sans modifier le score.
- [ ] Les badges, découvertes et points persistent après actualisation.
- [ ] La réinitialisation supprime exactement la clé de progression après confirmation.

### Visuelle et responsive

- [ ] Aucun texte, badge ou bouton ne déborde à 360 px.
- [ ] Les cartes restent lisibles sur desktop et tablette.
- [ ] Le logo reste net, avec un fond/format cohérent.
- [ ] Les images possèdent un fallback visuel.
- [ ] Les états verrouillé, débloqué, correct et incorrect sont évidents.
- [ ] Les animations sont fluides et non bloquantes.

### Accessibilité et qualité

- [ ] Navigation clavier complète possible.
- [ ] Focus visible partout.
- [ ] Contraste et textes alternatifs vérifiés.
- [ ] Réduction des animations prise en compte.
- [ ] `npm run lint` passe.
- [ ] `npm run build` passe.
- [ ] Test manuel sur au moins un Android et un iPhone, ou leurs émulateurs si un appareil manque.

## 16. Règles qualité

1. Ne modifier que les fichiers de l’étape en cours.
2. Tester mobile avant desktop.
3. Éviter toute dépendance non indispensable.
4. Créer un composant réutilisable lorsqu’un motif apparaît deux fois.
5. Ne jamais appeler `window` ou `localStorage` dans un composant serveur.
6. Tester réponse vraie, fausse, fiche déjà réussie et URL invalide.
7. Lancer `npm run lint` à chaque étape ; `npm run build` avant chaque démo importante.

## 17. Commandes

```bash
npm run dev    # Développement
npm run lint   # Vérification qualité
npm run build  # Vérification production
npm run start  # Version construite
```

Ouvrir ensuite `http://localhost:3000`. Pour un téléphone, utiliser l’adresse réseau fournie par Next.js, connecté au même Wi-Fi.

## 18. Évolutions après MVP

- Scan réel par caméra avec autorisation et solution de secours par lien.
- Carte SVG interactive de toutes les communes du Bénin.
- Audio narratif léger et contrôlable.
- Français, fon, yoruba et anglais, après validation éditoriale.
- Comptes, classement et statistiques seulement après clarification de la protection des données.
- Modes numériques liés aux jeux physiques : ludo, dames, cartes et échecs patrimoniaux.

---

## Première action recommandée

Commencer par **l’étape 0 : valider les cinq fiches, sources et usages autorisés des images**. Ensuite seulement, nous construirons l’étape 1. Cette progression protège la valeur culturelle du projet et permet une évolution propre.

---

## Journal des modifications — 22 août 2026

### Ce qui vient d’être codé

#### 1. Nouvelle identité visuelle

Les fichiers `app/layout.tsx` et `app/globals.css` ont remplacé l’apparence standard de Next.js par l’univers **Jeux Gagnants** :

- fond terre sombre, cartes brunes et accents or/bronze ;
- police Cinzel pour les titres royaux et Plus Jakarta Sans pour la lecture mobile ;
- halos lumineux, effets de verre et interactions tactiles ;
- support de la réduction des animations demandée par certains utilisateurs ;
- métadonnées du site en français.

#### 2. Accueil immersif

`app/page.tsx` contient maintenant la vraie page d’accueil :

- logo textuel et compteurs de progression ;
- promesse « Et si on jouait notre histoire ? » ;
- bouton `Simuler un Scan QR Code` qui ouvre actuellement la fiche d’Ouidah ;
- cartes cliquables vers Ouidah, Béhanzin et Ganvié ;
- premier aperçu du carnet de découverte.

#### 3. Les données locales du MVP

`data/patrimoine.json` rassemble cinq fiches démonstratives :

- Ouidah ;
- Roi Béhanzin ;
- Sègbo Lissa ;
- Ganvié ;
- Kétou.

Chaque fiche possède un identifiant QR/URL, un type, un sous-titre, une image externe affichée avec `<img>`, une histoire courte, un fait marquant et un quiz. `lib/types.ts` définit les structures TypeScript ; `lib/heritage.ts` sert à retrouver une fiche par son identifiant.

> Important : les textes, réponses et images actuels servent à la démonstration. Ils doivent être validés avec les sources culturelles, historiques et les droits d’utilisation avant une publication publique.

#### 4. Pages QR dynamiques

`app/scan/[id]/page.tsx` construit automatiquement une page pour chaque fiche. Par exemple :

- `/scan/ouidah`
- `/scan/behanzin`
- `/scan/segbo-lissa`
- `/scan/ganvie`
- `/scan/ketou`

La page affiche l’image, le type de contenu, la narration, le bloc « Le saviez-vous ? » et le quiz. Une URL inconnue présente une page de retour soignée grâce à `app/not-found.tsx`.

#### 5. Quiz, points, badges et confettis

`components/quiz-card.tsx` gère l’interaction principale :

- bonne réponse : confettis dorés, explication, points et badge ;
- mauvaise réponse : retour visuel rouge, message encourageant et possibilité de réessayer ;
- quiz déjà réussi : les points ne sont jamais ajoutés une deuxième fois.

`lib/progress.ts` enregistre cette progression dans le navigateur, avec la clé `jeux-gagnants:progress:v1`. `components/player-progress.tsx` lit cette progression et met à jour le compteur de l’accueil.

### Comment voir le résultat

1. Ouvrir un terminal dans le dossier du projet :

   ```powershell
   cd E:\MAAFRIK\gagnant_project
   ```

2. Lancer le serveur de développement :

   ```powershell
   npm run dev
   ```

3. Ouvrir l’adresse affichée dans le terminal, généralement :

   ```text
   http://localhost:3000
   ```

4. Cliquer sur `Simuler un Scan QR Code`, répondre au quiz d’Ouidah et observer : confettis, ajout de `100 pts` et badge. Actualiser ensuite la page : les points restent affichés, car ils sont enregistrés dans le navigateur.

5. Tester les autres fiches directement en ajoutant l’un des chemins ci-dessus à `http://localhost:3000`.

### Pour recommencer une démonstration à zéro

Dans le navigateur, ouvrir les outils de développement (`F12`) puis la console et saisir :

```js
localStorage.removeItem("jeux-gagnants:progress:v1");
location.reload();
```

Cela supprime uniquement les points et badges de Jeux Gagnants sur ce navigateur. Un bouton visuel « Réinitialiser ma démonstration » sera ajouté pendant l’étape de finition.

---

## Mise à jour — Communes d’abord

Le front se concentre maintenant sur la première collection avant d’étendre les autres :

- Les quatre cartes de la page d’accueil sont **Ouidah, Abomey, Ganvié et Natitingou**.
- Chaque carte mène vers une route dynamique : `/scan/ouidah`, `/scan/abomey`, `/scan/ganvie` ou `/scan/natitingou`.
- Ouidah devient la fiche modèle complète : **Place Chacha**, **Porte du Non-Retour**, **Temple des Pythons**, puis un défi de trois questions pour **150 points**.
- Les sections Royaumes & Histoire et Bénin contemporain restent hors du parcours prioritaire jusqu’à ce que les quatre communes soient illustrées et validées.

### Comment cette architecture grandira

Il n’est pas nécessaire de créer 77 pages à la main. Une seule page dynamique, `app/scan/[id]/page.tsx`, lit l’identifiant dans l’URL. Pour ajouter une commune, il faudra uniquement :

1. ajouter sa fiche (images, scènes, histoire et quiz) à `data/patrimoine.json` ;
2. créer le QR code qui pointe vers `/scan/<id>` ;
3. l’ajouter à la liste des cartes sur l’accueil.

Les images en ligne actuelles servent de maquettes visuelles. Elles devront être remplacées par des photos dont les droits, les légendes et le contexte culturel sont validés avant publication.

---

## Mise à jour — Visite guidée d’Ouidah

La page `/scan/ouidah` est maintenant organisée comme une visite, et non comme un long texte :

1. Introduction détaillée sur Ouidah, ses mémoires historiques et ses patrimoines vivants.
2. **Place Chacha** : localisation et contexte historique.
3. **Porte du Non-Retour** : localisation sur la plage de Djègbadji et fonction mémorielle.
4. **Temple des Pythons** : localisation à Dangbexuè / Place Agoli et présentation respectueuse du sanctuaire vodun.
5. Boutons `Lieu précédent` et `Lieu suivant` pour parcourir la visite une étape à la fois.
6. Phrase de défi et quiz de trois questions à la fin.

Les textes s’appuient notamment sur la [Mairie de Ouidah](https://ouidah.mairie.bj/site-touristique/la-porte-du-non-retour), [Bénin Tourisme](https://benintourisme.bj/destinations/le-temple-des-pythons/) et le [Gouvernement du Bénin](https://www.gouv.bj/article/2942/le-temple-%22dangbe%22-pythons-sanctuaire-vodun-face-basilique-immaculee-conception/). Les images de la Place Chacha et de la Porte du Non-Retour sont encore des images d’ambiance temporaires ; elles doivent être remplacées par des photos autorisées des lieux.

### Extension — Les sept lieux incontournables d’Ouidah

La visite contient désormais sept étapes :

1. Route de l’Esclave et Porte du Non-Retour ;
2. Temple des Pythons ;
3. Place Chacha et ancien marché ;
4. Fort Portugais / Musée d’Histoire de Ouidah ;
5. Basilique de l’Immaculée-Conception ;
6. Forêt sacrée de Kpassè ;
7. Maison du Brésil et héritages afro-brésiliens.

Les parcours mémoriels, les sites patrimoniaux et les sites spirituels sont confirmés par les informations publiées par le [Gouvernement du Bénin](https://www.gouv.bj/article/1055/destination-benin---ouidah-terre-hxueda--ville-vocation-historique--culturelle--cultuelle-touristique/) et les projets de [revalorisation de la cité historique](https://www.culture.gouv.bj/projects/11/projets-phares__autres-projets/home). Les histoires relatives à Kpassè, aux arbres et aux rites sont présentées comme des traditions orales ; elles nécessitent la validation d’un guide local ou d’un détenteur de savoir avant une version publique définitive.

### Mise en scène du défi Ouidah

Le quiz n’est plus visible directement. À la fin de la visite, le joueur découvre une carte d’entrée « **Épreuve du Connaisseur** » avec une lueur dorée, une couronne et une flamme. Il doit cliquer sur `Entrer dans l’arène` avant que les questions s’affichent.

- Trois questions maximum ; barre de progression `Question 1 / 3`.
- Bonne réponse : bouton vert émeraude et petite pluie de confettis.
- Mauvaise réponse : secousse et message « Presque ! Le python Dangbé veille… Réessaie ! ».
- Victoire : bannière animée, badge « Sceau de la Cité de Ouidah », gain total de **100 points**, confettis et bouton `Copier mon score`.

L’audio de victoire n’est pas ajouté pour l’instant : aucun son ne doit être déclenché automatiquement sur le téléphone d’un visiteur. Il pourra être ajouté ultérieurement comme option explicitement activée.

### Mise à jour — Visite guidée de Ganvié

`/scan/ganvie` utilise maintenant le même format immersif qu’Ouidah, avec cinq étapes :

1. Embarcadère d’Abomey-Calavi ;
2. Maisons sur pilotis ;
3. Marché flottant ;
4. Acadjas et pêche traditionnelle ;
5. Rues de pirogues et vie quotidienne.

La fiche termine par l’épreuve **Maître des Pirogues** : trois questions, 100 points, badge personnalisé et message de réessai lié au thème de l’eau.

Les repères essentiels — Ganvié sur le lac Nokoué dans la commune de Sô-Ava, installation historique des populations comme refuge, déplacement en pirogue, marchés et activités de pêche — sont documentés par [Bénin Tourisme](https://benintourisme.bj/destinations/ganvie/) et la [fiche officielle de Sô-Ava](https://decentralisation.gouv.bj/commune/20/so-ava/). La présentation des acadjas inclut volontairement un rappel environnemental : les techniques de pêche sont liées à un écosystème qui doit être préservé.

### Mise à jour — Défi en pop-up et apprentissage par la visite

Le défi est désormais séparé de l’histoire pour éviter qu’un visiteur réponde sans avoir exploré les lieux :

1. La carte « Épreuve du Connaisseur » reste à la fin de la visite.
2. Le clic sur `Entrer dans l’arène` ouvre une fenêtre immersive (pop-up) au-dessus de la page ; elle se ferme aussi avec `Échap` sur ordinateur.
3. Les défis d’Ouidah et de Ganvié comportent maintenant **5 questions de 20 points**, soit **100 points** au total.
4. Une mauvaise réponse n’arrête plus le jeu : la réponse est indiquée, puis le joueur passe automatiquement à la question suivante.
5. Chaque bonne réponse ajoute ses 20 points une seule fois dans le navigateur ; les 5 bonnes réponses débloquent aussi le badge.
6. Sinon, le bilan indique le score, propose `Revoir l’histoire des lieux` (retour fluide au parcours) ou `Retenter le défi`.

Ainsi, le quiz est une récompense de la visite : le joueur est encouragé à revenir aux images et aux récits plutôt qu’à deviner les réponses.

### Mise à jour — Les 77 routes de communes

`data/patrimoine.json` contient désormais les **77 communes officielles du Bénin**, avec un identifiant de route stable. Ganvié est conservé en plus comme **site culturel de Sô-Ava** : ce n’est pas une commune administrative, mais sa fiche reste accessible avec `/scan/ganvie`.

Les nouvelles fiches sont volontairement marquées `"isReady": false` : elles ouvrent bien leur URL de scan, mais affichent « Parcours en préparation » plutôt qu’une histoire ou un quiz inventé. Pour publier une commune, il faut compléter ses champs, ajouter ses scènes et cinq questions, puis remplacer `"isReady": false` par `"isReady": true`.

Exemple : le QR code de Kandi doit pointer vers `/scan/kandi`; celui de Sèmè-Podji vers `/scan/seme-podji`. Les identifiants sont toujours sans accents et en minuscules, afin de garder des QR codes fiables.

### Mise à jour — Royaumes & Histoire sur l’accueil

La page d’accueil présente désormais un résumé de contexte : le territoire du Bénin actuel a été marqué par plusieurs royaumes et dynasties, et non par une succession royale unique. Quatre cartes ouvrent les premières routes consacrées aux rois : `agadja`, `ghezo`, `behanzin` et `toffa-1er`.

Les fiches d’Agadja, Ghézo et Toffa Ier sont volontairement en préparation : elles seront enrichies avec des sources, des lieux, des images autorisées et un quiz complet avant publication. Cette prudence est importante car les récits de succession varient selon les sources écrites et les traditions dynastiques.

### Mise à jour — Routes des rois d’Abomey à compléter

Les routes suivantes sont créées dans `data/patrimoine.json` et peuvent déjà être utilisées dans les QR codes :

- `/scan/gangnihessou`
- `/scan/dakodonou`
- `/scan/houegbadja`
- `/scan/akaba`
- `/scan/tegbessou`
- `/scan/kpengla`
- `/scan/agonglo`
- `/scan/adandozan`
- `/scan/agoli-agbo`

Ces fiches sont marquées `"isReady": false`. Pour chacune, remplace l’image temporaire, complète l’histoire et les lieux dans `scenes`, ajoute les questions dans `quiz`, puis passe `isReady` à `true`. La route dynamique `app/scan/[id]/page.tsx` lit automatiquement l’identifiant du QR code : aucune nouvelle page de code n’est à créer pour chaque roi.

### Mise à jour — Explorer sans QR code

Une personne qui arrive directement sur le site peut maintenant cliquer sur `Explorer le Bénin`, puis choisir une collection :

- `/communes` pour les 77 communes ;
- `/royaumes` pour les rois et l’histoire ;
- `/contemporain` pour la collection Bénin contemporain.

Le QR code du jeu physique reste utile : il amène directement vers la même fiche, sans passer par les catalogues.

Sur l’accueil, chaque section possède aussi son accès complet : `Voir les 77 communes`, `Voir tous les rois` et `Voir le Bénin contemporain`. Les quatre cartes visibles dans une section servent seulement de sélection vedette ; les boutons ouvrent la collection entière.

### Mise à jour — Introduction Bénin contemporain

La page `/contemporain` explique maintenant le passage du pouvoir monarchique au cadre républicain : souveraineté nationale, institutions constitutionnelles et trois repères historiques — indépendance du 1er août 1960, Conférence des Forces Vives du 19 au 28 février 1990, puis promulgation de la Constitution le 11 décembre 1990. Les fiches de personnalités seront ajoutées ensuite avec des sources vérifiables et une ligne éditoriale neutre.

### Mise à jour — Carrousel Destination Bénin

La page d’accueil possède maintenant une section `Destination Bénin`, placée avant les gammes de jeux. Elle présente un carrousel tactile et responsive de destinations : Ouidah, Porto-Novo, Dangbo, Allada, Zè et Cotonou. Sur téléphone, on glisse naturellement les cartes ; sur écran plus large, deux flèches permettent de les parcourir. Chaque carte ouvre la fiche de scan associée.

### Mise à jour — Audit des liens et des routes

La navigation interne a été contrôlée : accueil, collections, communes, royaumes, Bénin contemporain, personnalités et page À propos répondent toutes correctement. Les liens d’ancrage `#nos-jeux` et `#communes` pointent vers des sections présentes sur l’accueil.

Les routes de scan sont générées depuis les identifiants de `data/patrimoine.json`. Ainsi, un QR code qui utilise un identifiant existant — par exemple `/scan/ouidah`, `/scan/ghezo` ou `/scan/kandi` — ouvre toujours une fiche. Lorsqu’une fiche n’est pas encore documentée, elle affiche clairement `Parcours en préparation` : ce n’est pas une page vide.

Enfin, toutes les images de l’interface utilisent désormais des balises HTML `<img>`, conformément à la règle du projet.

### Mise à jour — Expérience Mobile-First

L’interface est renforcée pour les visiteurs qui arrivent par QR code sur téléphone : le document bloque tout débordement horizontal, les images ne dépassent jamais leur conteneur et les boutons principaux gardent une zone tactile minimale de 44 px.

Une barre de navigation fixe apparaît sous `lg` avec quatre accès rapides : Accueil, Jeux, Explorer et Communes. Le contenu conserve un espace inférieur adapté à cette barre, y compris sur les téléphones avec une zone sûre (*safe area*).

Le défi est maintenant un **bottom sheet** sur mobile : il remonte depuis le bas de l’écran, utilise la hauteur visible du téléphone et garde un bouton de fermeture confortable. Dès la taille `sm`, il redevient une modale centrée pour une lecture plus large.

### Mise à jour — Carrousels et retour à l’exploration

Sur téléphone, les quatre cartes mises en avant dans **Gamme 01 · Communes** et **Gamme 02 · Royaumes** deviennent des carrousels tactiles. Le joueur glisse horizontalement, carte par carte ; à partir de `sm`, ces mêmes cartes reprennent leur affichage en grille.

Depuis une fiche de scan, `Retour à l’exploration` utilise l’historique du navigateur. Après avoir ouvert Ouidah, un roi ou toute autre fiche depuis une liste, le retour ramène donc exactement à la position de défilement où le joueur avait quitté l’exploration. Si une fiche est ouverte directement depuis un QR code, le bouton revient simplement à l’accueil.

### Mise à jour — QR codes des 77 communes

Les dépendances `qrcode` et `qrcode.react` sont installées. Si elles doivent être réinstallées sur une autre copie du projet :

```powershell
npm install qrcode qrcode.react
```

Chaque QR imprimé encode l’URL publique stable `https://jeuxgagnants.bj/communes/[slug]`. Cette URL redirige vers la fiche actuelle `/scan/[slug]`, ce qui permet de garder les QR déjà imprimés si le front change plus tard.

- `app/components/CommuneQRCode.tsx` : aperçu React responsive, nom de la commune et bouton de téléchargement.
- `app/api/qr/[slug]/route.js` : téléchargement d’un PNG de 1200 px, correction d’erreur `H` et couleur déterminée par le slug.
- `scripts/export-qrcodes.mjs` : export en masse des 77 communes dans `out_qrcodes/`.

Pour générer tous les fichiers imprimeur :

```powershell
npm run export:qrcodes
```

Les PNG générés ne sont pas envoyés dans Git (`out_qrcodes/` est ignoré). Le nom est affiché près du QR sur la carte ; l’URL contient aussi le slug de la commune. Il ne faut pas poser du texte au milieu des modules du QR : cela compromettrait la lecture par appareil photo, même avec une correction d’erreur élevée.
