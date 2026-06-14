import { formatLocalYmd } from "./calendar-date";
import { ChildId } from "./types";

export type DayKind = "school" | "off" | "vacation";

/** Vacances scolaires (Zone B — modifiable). Inclus : Toussaint, Noël, Hiver, Printemps, Été. */
const VACATION_RANGES: { start: string; end: string; label: string }[] = [
  { start: "2025-10-18", end: "2025-11-03", label: "Toussaint" },
  { start: "2025-12-20", end: "2026-01-05", label: "Vacances de Noël" },
  { start: "2026-02-07", end: "2026-02-23", label: "Vacances d'hiver" },
  { start: "2026-04-11", end: "2026-04-27", label: "Vacances de printemps" },
  { start: "2026-07-04", end: "2026-08-31", label: "Vacances d'été" },
];

/** Jours fériés (pas de cours). */
const PUBLIC_HOLIDAYS = new Set([
  "2025-11-01",
  "2025-11-11",
  "2025-12-25",
  "2026-01-01",
  "2026-04-06",
  "2026-05-01",
  "2026-05-08",
  "2026-05-14",
  "2026-05-25",
]);

const WEEKDAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"] as const;

/** Jours de cours par enfant (0 = dimanche). */
const SCHOOL_WEEKDAYS: Record<ChildId, number[]> = {
  lisandro: [1, 2, 3, 4, 5],
  mila: [1, 2, 4, 5],
};

export interface DayContext {
  ymd: string;
  weekday: number;
  weekdayLabel: string;
  dayKind: DayKind;
  isSchoolDay: boolean;
  isWeekend: boolean;
  isVacation: boolean;
  isPublicHoliday: boolean;
  vacationLabel?: string;
  /** Mila : séance ortho (mer 14h, ven 18h). */
  milaOrthoSession: boolean;
  /** Mila : exercices ortho à la maison (hors séance). */
  milaOrthoHome: boolean;
  /** Lisandro : cours le matin (mer inclus). */
  lisandroHasSchool: boolean;
  events: string[];
}

function parseYmd(ymd: string): Date {
  return new Date(`${ymd}T12:00:00`);
}

export function isInVacation(ymd: string): { active: boolean; label?: string } {
  for (const range of VACATION_RANGES) {
    if (ymd >= range.start && ymd <= range.end) {
      return { active: true, label: range.label };
    }
  }
  return { active: false };
}

export function isPublicHoliday(ymd: string): boolean {
  return PUBLIC_HOLIDAYS.has(ymd);
}

export function isSchoolDayForChild(ymd: string, childId: ChildId): boolean {
  const d = parseYmd(ymd);
  const weekday = d.getDay();
  if (isPublicHoliday(ymd)) return false;
  if (isInVacation(ymd).active) return false;
  return SCHOOL_WEEKDAYS[childId].includes(weekday);
}

export function getDayKind(ymd: string, childId: ChildId): DayKind {
  const vacation = isInVacation(ymd);
  if (vacation.active) return "vacation";
  if (isSchoolDayForChild(ymd, childId)) return "school";
  return "off";
}

export function getDayContext(date: Date, childId: ChildId): DayContext {
  const ymd = formatLocalYmd(date);
  const weekday = date.getDay();
  const vacation = isInVacation(ymd);
  const holiday = isPublicHoliday(ymd);
  const isWeekend = weekday === 0 || weekday === 6;
  const isSchoolDay = isSchoolDayForChild(ymd, childId);
  const dayKind = getDayKind(ymd, childId);

  const milaOrthoSession = childId === "mila" && (weekday === 3 || weekday === 5);
  const milaOrthoHome =
    childId === "mila" &&
    !milaOrthoSession &&
    !vacation.active &&
    !holiday &&
    (weekday === 1 || weekday === 2 || weekday === 4 || weekday === 0 || weekday === 6);

  const lisandroHasSchool = childId === "lisandro" && isSchoolDay;

  const events: string[] = [];
  if (vacation.active && vacation.label) events.push(vacation.label);
  if (holiday) events.push("Jour férié");
  if (isSchoolDay) events.push("École");
  if (childId === "lisandro" && weekday === 3 && !vacation.active && !holiday) {
    events.push("Collège le matin");
  }
  if (milaOrthoSession) events.push("Ortho Adrien");
  if (isWeekend && dayKind !== "vacation") events.push("Week-end");

  return {
    ymd,
    weekday,
    weekdayLabel: WEEKDAY_LABELS[weekday],
    dayKind,
    isSchoolDay,
    isWeekend,
    isVacation: vacation.active,
    isPublicHoliday: holiday,
    vacationLabel: vacation.label,
    milaOrthoSession,
    milaOrthoHome,
    lisandroHasSchool,
    events,
  };
}

/** Grille mensuelle : lundi → dimanche. */
export function getMonthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1, 12);
  const lastDay = new Date(year, month + 1, 0, 12).getDate();
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1;

  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) {
    cells.push(formatLocalYmd(new Date(year, month, d, 12)));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export const DAY_KIND_LABELS: Record<DayKind, string> = {
  school: "École",
  off: "Sans école",
  vacation: "Vacances",
};

export const DAY_KIND_COLORS: Record<DayKind, { bg: string; text: string; border: string }> = {
  school: { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" },
  off: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" },
  vacation: { bg: "bg-emerald-100", text: "text-emerald-900", border: "border-emerald-300" },
};
