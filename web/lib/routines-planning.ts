import { ChildId } from "./types";

type PlanningItem = {
  day: string;
  items: string[];
};

type ChildStructure = {
  routines: string[];
  planning: PlanningItem[];
};

export const routinesPlanningByChild: Record<ChildId, ChildStructure> = {
  lisandro: {
    routines: [
      "Poser le sac et ranger les chaussures",
      "Vider/remplir le lave-vaisselle si besoin",
      "15 min de décompression sans écran",
      "Devoirs dans un espace commun",
      "Vérifier le cartable du lendemain",
      "Rendre le téléphone à 20h en cuisine",
    ],
    planning: [
      { day: "Lundi", items: ["Routine retour", "Check-in soir", "Téléphone 20h"] },
      { day: "Mardi", items: ["Routine retour", "Check-in soir", "Téléphone 20h"] },
      { day: "Mercredi", items: ["Poubelles plastique", "Check-in soir"] },
      { day: "Jeudi", items: ["Routine retour", "Check-in soir", "Téléphone 20h"] },
      { day: "Vendredi", items: ["Routine retour", "Film famille 20h30"] },
      { day: "Samedi", items: ["Sport/Lutte", "Tâche maison hebdo"] },
      { day: "Dimanche", items: ["Réunion famille 18h", "Comptage hebdo"] },
    ],
  },
  mila: {
    routines: [
      "Poser le sac et ranger les chaussures",
      "Préparer son goûter seule",
      "20 min de décompression sans écran",
      "Exercices ortho (15-20 min max)",
      "Douche avant 20h30",
      "Préparer le cartable le soir",
    ],
    planning: [
      { day: "Lundi", items: ["Ortho", "Douche", "Check-in soir"] },
      { day: "Mardi", items: ["Danse", "Douche", "Check-in soir"] },
      { day: "Mercredi", items: ["Ortho", "Douche + cheveux", "Comptage"] },
      { day: "Jeudi", items: ["Douche", "Check-in soir"] },
      { day: "Vendredi", items: ["Ortho", "Douche", "Film famille"] },
      { day: "Samedi", items: ["Douche + cheveux", "Tâche maison hebdo"] },
      { day: "Dimanche", items: ["Douche", "Réunion famille 18h"] },
    ],
  },
};
