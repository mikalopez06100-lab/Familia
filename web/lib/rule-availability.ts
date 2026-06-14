import { getDayContext } from "./school-calendar";
import { ChildId, Rule, RuleSchedule } from "./types";

function scheduleMatches(schedule: RuleSchedule, childId: ChildId, date: Date): boolean {
  const ctx = getDayContext(date, childId);
  const { weekday, dayKind, isSchoolDay, milaOrthoSession, milaOrthoHome } = ctx;

  switch (schedule) {
    case "always":
      return true;
    case "school":
      return dayKind === "school" && isSchoolDay;
    case "off":
      return dayKind === "off";
    case "vacation":
      return dayKind === "vacation";
    case "not_vacation":
      return dayKind !== "vacation";
    case "weekend":
      return dayKind === "off" && (weekday === 0 || weekday === 6);
    case "sunday":
      return weekday === 0;
    case "sat_sun":
      return weekday === 0 || weekday === 6;
    case "mila_ortho_home":
      return childId === "mila" && milaOrthoHome;
    case "mila_ortho_session":
      return childId === "mila" && milaOrthoSession;
    default:
      return true;
  }
}

export function isRuleAvailable(rule: Rule, childId: ChildId, date: Date = new Date()): boolean {
  if (rule.deprecated) return false;
  if (rule.childId !== childId) return false;
  const schedule = rule.schedule ?? "always";
  return scheduleMatches(schedule, childId, date);
}

export function filterAvailableRules(rules: Rule[], childId: ChildId, type: Rule["type"], date: Date = new Date()) {
  return rules.filter((r) => r.type === type && isRuleAvailable(r, childId, date));
}

export function scheduleLabel(schedule: RuleSchedule): string {
  const labels: Record<RuleSchedule, string> = {
    always: "Tous les jours",
    school: "Jours d'école",
    off: "Jours sans école",
    vacation: "Vacances",
    not_vacation: "Hors vacances",
    weekend: "Week-end",
    sunday: "Dimanche",
    sat_sun: "Samedi et dimanche",
    mila_ortho_home: "Ortho à la maison (lun, mar, jeu, sam, dim)",
    mila_ortho_session: "Séance ortho (mer, ven)",
  };
  return labels[schedule];
}
