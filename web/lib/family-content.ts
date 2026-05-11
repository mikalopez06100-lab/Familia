import { ChildId } from "./types";

type PlanningDay = {
  day: string;
  events: string[];
};

export const childRoutines: Record<ChildId, string[]> = {
  lisandro: [
    "Poser le sac dans sa chambre et ranger les chaussures",
    "Vider/remplir le lave-vaisselle si besoin",
    "15 min de décompression (sans écran)",
    "Devoirs dans le séjour ou la cuisine",
    "Préparer le cartable du lendemain",
    "Temps libre jusqu'à 20h",
    "20h: téléphone dans la boîte en cuisine",
  ],
  mila: [
    "Sac posé et chaussures rangées",
    "Préparer son goûter seule (liste autorisée)",
    "20 min de décompression (dessin/jeu calme)",
    "Exercices ortho 15 à 20 min (minuteur visible)",
    "Temps libre jusqu'au dîner",
    "Douche avant 20h30 (avant ou après dîner)",
    "Préparer le cartable avec la checklist image",
  ],
};

export const childPlanning: Record<ChildId, PlanningDay[]> = {
  lisandro: [
    { day: "Lun", events: ["Routine retour", "Douche", "20h téléphone", "Bilan Barkley (journée ou soir)"] },
    { day: "Mar", events: ["Routine retour", "Douche", "20h téléphone", "Bilan Barkley (journée ou soir)"] },
    { day: "Mer", events: ["Poubelles plastique", "Douche", "20h téléphone", "Comptage points (journée ou soir)"] },
    { day: "Jeu", events: ["Routine retour", "Douche", "20h téléphone", "Bilan Barkley (journée ou soir)"] },
    { day: "Ven", events: ["Routine retour", "Douche", "Film famille 20h30"] },
    { day: "Sam", events: ["Lutte 17h", "Tâche salle de bain (tour)", "Écrans limités"] },
    { day: "Dim", events: ["Douche", "Réunion famille 18h", "Préparation semaine"] },
  ],
  mila: [
    { day: "Lun", events: ["Routine retour", "Ortho 18h", "Douche + cheveux", "Bilan Barkley (journée ou soir)"] },
    { day: "Mar", events: ["Routine retour", "Danse 18h", "Douche", "Bilan Barkley (journée ou soir)"] },
    { day: "Mer", events: ["Ortho 14h", "Douche + cheveux", "Comptage étoiles (journée ou soir)"] },
    { day: "Jeu", events: ["Routine retour", "Douche", "Bilan Barkley (journée ou soir)"] },
    { day: "Ven", events: ["Ortho 18h", "Douche", "Film famille 20h30"] },
    { day: "Sam", events: ["Douche + cheveux", "Écrans limités", "Temps calme"] },
    { day: "Dim", events: ["Douche", "Réunion famille 18h", "Préparation cartable"] },
  ],
};
