import { formatLocalYmd } from "./calendar-date";
import { getDayContext } from "./school-calendar";
import { ChildId } from "./types";

export type ScreenTimeBlock = {
  title: string;
  subtitle?: string;
  items: string[];
};

const DAY_NAMES = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const;

/** Forfait Lisandro en semaine type école (minutes loisirs). */
const LISANDRO_WEEKDAY_MINUTES: Record<number, number> = {
  0: 120,
  1: 0,
  2: 60,
  3: 120,
  4: 60,
  5: 120,
  6: 120,
};

export function isMonday(date: Date = new Date()): boolean {
  return date.getDay() === 1;
}

export function canRedeemScreenTime(date: Date = new Date()): boolean {
  return !isMonday(date);
}

const MONDAY_SCREEN_DETAIL =
  "Lundi : aucun écran du tout. Pas de rachat +30 min possible avec les points.";

export function formatMinutes(m: number): string {
  if (m === 0) return "0 min (pas d'écrans)";
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (min === 0) return `${h}h`;
  return `${h}h${String(min).padStart(2, "0")}`;
}

function rachatSuffix(date: Date): string {
  return canRedeemScreenTime(date) ? " Rachat +30 min possible avec les points." : "";
}

/** Forfait du jour pour un enfant (loisirs : tél, tablette, TV, Switch…). */
export function getTodayScreenAllowance(childId: ChildId, date: Date = new Date()) {
  if (isMonday(date)) {
    return {
      label: "Lundi",
      minutes: 0,
      detail: MONDAY_SCREEN_DETAIL,
      canRedeem: false,
    };
  }

  const ctx = getDayContext(date, childId);
  const weekday = date.getDay();
  const canRedeem = true;

  if (childId === "lisandro") {
    if (ctx.dayKind === "vacation") {
      return {
        label: "Vacances",
        minutes: 150,
        detail: `Max 2h30 d'écrans loisirs par jour.${rachatSuffix(date)}`,
        canRedeem,
      };
    }
    const minutes = LISANDRO_WEEKDAY_MINUTES[weekday] ?? 0;
    return {
      label: ctx.dayKind === "school" ? "Semaine type école" : "Sans école",
      minutes,
      detail:
        minutes === 0
          ? `Pas d'écrans loisirs le ${DAY_NAMES[weekday]}.${rachatSuffix(date)}`
          : `Forfait ${formatMinutes(minutes)} le ${DAY_NAMES[weekday]}.${rachatSuffix(date)}`,
      canRedeem,
    };
  }

  // Mila
  if (ctx.dayKind === "vacation") {
    return {
      label: "Vacances",
      minutes: 120,
      detail: `Max 2h d'écrans loisirs.${rachatSuffix(date)}`,
      canRedeem,
    };
  }
  if (ctx.isSchoolDay) {
    return {
      label: "Jour d'école",
      minutes: 30,
      detail: `Max 30 min après goûter + exercices ortho faits.${rachatSuffix(date)}`,
      canRedeem,
    };
  }
  if (ctx.milaOrthoSession) {
    return {
      label: "Séance ortho",
      minutes: 45,
      detail: `Max 45 min après les obligations du jour (ortho Adrien).${rachatSuffix(date)}`,
      canRedeem,
    };
  }
  return {
    label: "Week-end / jour sans école",
    minutes: weekday === 0 ? 60 : 90,
    detail:
      weekday === 0
        ? `Dimanche : max 1h loisirs.${rachatSuffix(date)}`
        : `Samedi : max 1h30 loisirs.${rachatSuffix(date)}`,
    canRedeem,
  };
}

/** Forfait écrans par type de jour (référence hebdomadaire). */
export const childScreenTimeRules: Record<ChildId, ScreenTimeBlock[]> = {
  lisandro: [
    {
      title: "Lundi",
      items: [
        "Aucun écran du tout (tél, tablette, TV, Switch…).",
        "Pas de rachat « +30 min écrans » possible le lundi.",
      ],
    },
    {
      title: "Semaine type école",
      subtitle: "Collège lun–ven (mer : matin seulement)",
      items: [
        "Mardi et jeudi : 1h max.",
        "Mercredi, vendredi, samedi et dimanche : 2h max.",
        "Rachat « +30 min écrans » : du mardi au dimanche uniquement.",
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
        "Max 2h30 d'écrans loisirs par jour (sauf lundi : aucun écran).",
        "Pas d'écran pendant les repas et 1h avant le coucher.",
        "Rachat +30 min possible du mardi au dimanche.",
      ],
    },
  ],
  mila: [
    {
      title: "Lundi",
      items: [
        "Aucun écran du tout (tablette, TV, Switch…).",
        "Pas de rachat « +30 min écrans » possible le lundi.",
      ],
    },
    {
      title: "Jours d'école (lun, mar, jeu, ven)",
      subtitle: "École + activités",
      items: [
        "Pas d'écran le matin avant l'école.",
        "Goûter préparé seule + prête à l'heure le matin.",
        "Exercices ortho à la maison : lun, mar, jeu (pas mer/ven).",
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
        "Rachat +30 min : du mardi au dimanche uniquement.",
      ],
    },
    {
      title: "Vacances et jours fériés",
      items: [
        "Max 2h d'écrans loisirs par jour (sauf lundi : aucun écran).",
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
