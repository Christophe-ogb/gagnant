export type Department = { slug: string; nom: string; chefLieu: string; region: string; communes: string[] };

export const departments: Department[] = [
  { slug: "alibori", nom: "Alibori", chefLieu: "Kandi", region: "Nord", communes: ["banikoara", "gogounou", "kandi", "karimama", "malanville", "segbana"] },
  { slug: "atacora", nom: "Atacora", chefLieu: "Natitingou", region: "Nord", communes: ["boukoumbe", "cobly", "kerou", "kouande", "materi", "natitingou", "ouassa-pehunco", "tanguieta", "toucountouna"] },
  { slug: "atlantique", nom: "Atlantique", chefLieu: "Allada", region: "Sud", communes: ["abomey-calavi", "allada", "kpomasse", "ouidah", "so-ava", "toffo", "tori-bossito", "ze"] },
  { slug: "borgou", nom: "Borgou", chefLieu: "Parakou", region: "Nord", communes: ["bembereke", "kalale", "ndali", "nikki", "parakou", "perere", "sinende", "tchaourou"] },
  { slug: "collines", nom: "Collines", chefLieu: "Dassa-Zoumé", region: "Centre", communes: ["bante", "dassa-zoume", "glazoue", "ouesse", "savalou", "save"] },
  { slug: "couffo", nom: "Couffo", chefLieu: "Aplahoué", region: "Sud", communes: ["aplahoue", "djakotomey", "dogbo", "klouekanme", "lalo", "toviklin"] },
  { slug: "donga", nom: "Donga", chefLieu: "Djougou", region: "Nord", communes: ["bassila", "copargo", "djougou", "ouake"] },
  { slug: "littoral", nom: "Littoral", chefLieu: "Cotonou", region: "Sud", communes: ["cotonou"] },
  { slug: "mono", nom: "Mono", chefLieu: "Lokossa", region: "Sud", communes: ["athieme", "bopa", "come", "grand-popo", "houeyogbe", "lokossa"] },
  { slug: "oueme", nom: "OuÉmé", chefLieu: "Porto-Novo", region: "Sud", communes: ["adjara", "adjohoun", "aguegues", "akpro-misserete", "avrankou", "bonou", "dangbo", "porto-novo", "seme-podji"] },
  { slug: "plateau", nom: "Plateau", chefLieu: "Pobè", region: "Sud", communes: ["adja-ouere", "ifangni", "ketou", "pobe", "sakete"] },
  { slug: "zou", nom: "Zou", chefLieu: "Abomey", region: "Centre", communes: ["abomey", "agbangnizoun", "bohicon", "cove", "djidja", "ouinhi", "za-kpota", "zagnanado", "zogbodomey"] }
];
