import { ChildId } from "./types";

export type ScreenTimeBlock = {
  title: string;
  subtitle?: string;
  items: string[];
};

/** Forfait écrans par type de jour (tél, tablette, TV, console, Switch…). */
export const childScreenTimeRules: Record<ChildId, ScreenTimeBlock[]> = {
  lisandro: [
    {
      title: "Jours d'école (lun, mar, jeu, ven)",
      subtitle: "Collège journée complète",
      items: [
        "Pas d'écran personnel le matin avant le départ.",
        "Écrans loisirs (tél, tablette, TV, Switch, console) : max 45 min après devoirs, avant 20h.",
        "20h : téléphone dans la boîte en cuisine — fin des écrans personnels.",
        "Les écrans « famille » (film du vendredi soir, etc.) ne comptent pas dans le forfait loisirs.",
      ],
    },
    {
      title: "Mercredi",
      subtitle: "Cours le matin uniquement",
      items: [
        "Matin : pas d'écran (temps libre calme, devoirs légers ou sortie).",
        "Après-midi : max 1h30 d'écrans loisirs (tél, tablette, TV, Switch…), en une ou deux sessions.",
        "20h : téléphone en boîte comme en semaine.",
      ],
    },
    {
      title: "Week-end (sam, dim)",
      items: [
        "Samedi : max 2h d'écrans loisirs sur la journée.",
        "Dimanche : max 1h30 d'écrans loisirs (+ film famille le soir = hors forfait).",
        "Récompense « +30 min écrans » : s'ajoute au forfait du samedi uniquement.",
        "Pas d'écran après 21h sauf accord parental.",
      ],
    },
    {
      title: "Vacances et jours fériés",
      items: [
        "Max 2h30 d'écrans loisirs par jour (tous appareils confondus).",
        "Toujours pas d'écran pendant les repas et 1h avant le coucher.",
        "20h : règle du téléphone en boîte maintenue en semaine type école.",
      ],
    },
  ],
  mila: [
    {
      title: "Jours d'école (lun, mar, jeu, ven)",
      subtitle: "École + activités (ortho, danse…)",
      items: [
        "Pas d'écran le matin avant l'école.",
        "Après le retour : écrans loisirs (tablette, TV, Switch…) max 30 min une fois goûter + exercices faits.",
        "Pas d'écran pendant le dîner ; arrêt des écrans 1h avant le coucher.",
        "Douche avant 20h30 : pas de tablette/TV pendant la douche.",
      ],
    },
    {
      title: "Mercredi",
      subtitle: "Journée plus légère (ex. ortho l'après-midi)",
      items: [
        "Matin : pas d'écran.",
        "Après-midi : max 45 min d'écrans loisirs (tablette, TV, Switch…), après les obligations du jour.",
        "Même coupure avant le coucher qu'en semaine.",
      ],
    },
    {
      title: "Week-end (sam, dim)",
      items: [
        "Samedi : max 1h30 d'écrans loisirs.",
        "Dimanche : max 1h (+ dessert/film famille = hors forfait).",
        "Récompense « +30 min écrans » : s'ajoute au forfait du jour où elle est rachetée.",
        "Temps calme sans écran chaque jour (dessin, jeu, lecture).",
      ],
    },
    {
      title: "Vacances et jours fériés",
      items: [
        "Max 2h d'écrans loisirs par jour (tablette, TV, Switch…).",
        "Sessions de 20–30 min max ; pause active entre deux sessions.",
        "Pas d'écran au réveil ni pendant les repas.",
      ],
    },
  ],
};
