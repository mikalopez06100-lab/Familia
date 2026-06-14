import { formatLocalYmd } from "./calendar-date";
import { getDayContext } from "./school-calendar";
import { ChildId } from "./types";

export type ScreenTimeBlock = {
  title: string;
  subtitle?: string;
  items: string[];
};

/** Forfait Lisandro en semaine type école (minutes loisirs). */
const LISANDRO_WEEKDAY_MINUTES: Record<number, number | null> = {
  0: 120, // dim 2h
  1: 0, // lun pas d'écrans
  2: 60, // mar 1h
  3: 120, // mer 2h
  4: 60, // jeu 1h
  5: 120, // ven 2h
  6: 120, // sam 2h
};

export function formatMinutes(m: number): string {
  if (m === 0) return "0 min (pas d'écrans loisirs)";
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (min === 0) return `${h}h`;
  return `${h}h${String(min).padStart(2, "0")}`;
}

/** Forfait du jour pour un enfant (loisirs : tél, tablette, TV, Switch…). */
export function getTodayScreenAllowance(childId: ChildId, date: Date = new Date()) {
  const ctx = getDayContext(date, childId);
  const weekday = date.getDay();

  if (childId === "lisandro") {
    if (ctx.dayKind === "vacation") {
      return {
        label: "Vacances",
        minutes: 150,
        detail: "Max 2h30 d'écrans loisirs par jour. Rachat +30 min possible avec les points.",
      };
    }
    const minutes = LISANDRO_WEEKDAY_MINUTES[weekday] ?? 0;
    const dayNames = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    return {
      label: ctx.dayKind === "school" ? "Semaine type école" : "Sans école",
      minutes,
      detail:
        minutes === 0
          ? `Pas d'écrans loisirs le ${dayNames[weekday]}. Rachat +30 min possible avec les points.`
          : `Forfait ${formatMinutes(minutes)} le ${dayNames[weekday]}. Rachat +30 min possible avec les points.`,
    };
  }

  // Mila
  if (ctx.dayKind === "vacation") {
    return {
      label: "Vacances",
      minutes: 120,
      detail: "Max 2h d'écrans loisirs. Rachat +30 min possible avec les points.",
    };
  }
  if (ctx.isSchoolDay) {
    return {
      label: "Jour d'école",
      minutes: 30,
      detail: "Max 30 min après goûter + exercices ortho faits. Rachat +30 min possible.",
    };
  }
  if (ctx.milaOrthoSession) {
    return {
      label: "Séance ortho",
      minutes: 45,
      detail: "Max 45 min après les obligations du jour (ortho Adrien). Rachat +30 min possible.",
    };
  }
  return {
    label: "Week-end / jour sans école",
    minutes: weekday === 0 ? 60 : 90,
    detail: weekday === 0 ? "Dimanche : max 1h loisirs." : "Samedi : max 1h30 loisirs. Rachat +30 min possible.",
  };
}

/** Forfait écrans par type de jour (référence hebdomadaire). */
export const childScreenTimeRules: Record<ChildId, ScreenTimeBlock[]> = {
  lisandro: [
    {
      title: "Semaine type école",
      subtitle: "Collège lun–ven (mer : matin seulement)",
      items: [
        "Lundi : pas d'écrans loisirs.",
        "Mardi et jeudi : 1h max (tél, tablette, TV, Switch…).",
        "Mercredi, vendredi, samedi et dimanche : 2h max.",
        "Rachat « +30 min écrans » : s'ajoute au forfait du jour.",
        "Les écrans « famille » (film du vendredi soir, etc.) ne comptent pas dans le forfait loisirs.",
      ],
    },
    {
      title: "Week-end",
      items: [
        "Pas de routine retour collège.",
        "Devoirs du week-end : validation le dimanche uniquement.",
        "Tâches hebdo (SDB / poubelles) : samedi et dimanche.",
        "Chambre + lit et attitude coopérative : tous les jours.",
      ],
    },
    {
      title: "Vacances et jours fériés",
      items: [
        "Max 2h30 d'écrans loisirs par jour (tous appareils confondus).",
        "Pas d'écran pendant les repas et 1h avant le coucher.",
        "Rachat +30 min toujours possible avec les points.",
      ],
    },
  ],
  mila: [
    {
      title: "Jours d'école (lun, mar, jeu, ven)",
      subtitle: "École + activités",
      items: [
        "Pas d'écran le matin avant l'école.",
        "Goûter préparé seule + prête à l'heure le matin.",
        "Exercices ortho à la maison : lun, mar, jeu (pas le jour de la séance).",
        "Après le retour : max 30 min écrans loisirs une fois goûter + exercices faits.",
      ],
    },
    {
      title: "Mercredi et vendredi — ortho Adrien",
      items: [
        "Pas d'école le mercredi ; séance ortho 14h (mer) et 18h (ven).",
        "Pas d'exercices ortho à la maison ces jours-là — attitude coopérative chez Adrien.",
        "Max 45 min écrans loisirs après les obligations du jour.",
      ],
    },
    {
      title: "Week-end (sam, dim)",
      items: [
        "Exercices ortho à la maison : samedi et dimanche.",
        "Douches (simple + cheveux) : tous les jours.",
        "Tâche hebdo : dimanche uniquement.",
        "Samedi : max 1h30 écrans · Dimanche : max 1h.",
      ],
    },
    {
      title: "Vacances et jours fériés",
      items: [
        "Max 2h d'écrans loisirs par jour.",
        "Sessions de 20–30 min max ; pause active entre deux sessions.",
        "Séances ortho maintenues si prévues (mer, ven).",
      ],
    },
  ],
};

export function getTodayScreenSummary(childId: ChildId, date: Date = new Date()) {
  const allowance = getTodayScreenAllowance(childId, date);
  const ymd = formatLocalYmd(date);
  return { ymd, ...allowance };
}
