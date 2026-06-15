import { ChildId } from "./types";

type PlanningDay = {
  day: string;
  events: string[];
};

export const childRoutines: Record<ChildId, string[]> = {
  lisandro: [
    "Poser le sac dans sa chambre et ranger les chaussures (jours d'école)",
    "Vider/remplir le lave-vaisselle si besoin",
    "15 min de décompression (sans écran)",
    "Devoirs dans le séjour ou la cuisine (sem.) / devoirs week-end le dimanche",
    "Préparer le cartable du lendemain (jours d'école)",
    "Respecter le forfait écrans du jour (voir agenda)",
    "Rachat +30 min possible avec les points du mardi au dimanche (pas le lundi)",
  ],
  mila: [
    "Sac posé et chaussures rangées (jours d'école)",
    "Préparer son goûter seule — jours d'école uniquement",
    "20 min de décompression (dessin/jeu calme)",
    "Exercices ortho 15–20 min (lun, mar, jeu, sam, dim — pas mer/ven)",
    "Mercredi / vendredi : séance ortho Adrien — attitude coopérative",
    "Douche (simple ou cheveux) avant 20h30",
    "Préparer le cartable avec la checklist image (jours d'école)",
  ],
};

export const childPlanning: Record<ChildId, PlanningDay[]> = {
  lisandro: [
    {
      day: "Lun",
      events: ["École", "Routine retour", "Aucun écran", "Pas de rachat écrans", "Bilan Barkley (journée ou soir)"],
    },
    {
      day: "Mar",
      events: ["École", "Routine retour", "1h écrans max", "Bilan Barkley (journée ou soir)"],
    },
    {
      day: "Mer",
      events: ["Collège le matin", "Routine retour midi", "2h écrans max l'après-midi", "Comptage points"],
    },
    {
      day: "Jeu",
      events: ["École", "Routine retour", "1h écrans max", "Bilan Barkley (journée ou soir)"],
    },
    {
      day: "Ven",
      events: ["École", "Routine retour", "2h écrans max", "Film famille 20h30"],
    },
    {
      day: "Sam",
      events: ["Sans école", "Tâche SDB ou poubelles", "2h écrans max", "Lutte 17h"],
    },
    {
      day: "Dim",
      events: ["Sans école", "Devoirs du week-end", "Tâche hebdo", "2h écrans max", "Réunion famille 18h"],
    },
  ],
  mila: [
    {
      day: "Lun",
      events: ["École", "Exercices ortho maison", "Goûter seule", "Prête à l'heure", "Aucun écran", "Bilan Barkley"],
    },
    {
      day: "Mar",
      events: ["École", "Exercices ortho maison", "Danse 18h", "Goûter seule", "Bilan Barkley"],
    },
    {
      day: "Mer",
      events: ["Pas d'école", "Ortho Adrien 14h", "Attitude coopérative chez Adrien", "Comptage étoiles"],
    },
    {
      day: "Jeu",
      events: ["École", "Exercices ortho maison", "Goûter seule", "Bilan Barkley"],
    },
    {
      day: "Ven",
      events: ["École", "Ortho Adrien 18h", "Attitude coopérative chez Adrien", "Film famille 20h30"],
    },
    {
      day: "Sam",
      events: ["Exercices ortho maison", "Douche + cheveux", "1h30 écrans max", "Temps calme"],
    },
    {
      day: "Dim",
      events: ["Exercices ortho maison", "Tâche hebdo (SDB ou courses)", "1h écrans max", "Réunion famille 18h"],
    },
  ],
};
