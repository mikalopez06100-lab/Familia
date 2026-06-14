export type ChildId = "lisandro" | "mila";
export type RuleType = "gain" | "loss" | "reward";

export type RuleSchedule =
  | "always"
  | "school"
  | "off"
  | "vacation"
  | "not_vacation"
  | "weekend"
  | "sunday"
  | "sat_sun"
  | "mila_ortho_home"
  | "mila_ortho_session";

export interface Rule {
  id: string;
  childId: ChildId;
  label: string;
  value: number;
  type: RuleType;
  rewardCost?: number;
  /** Quand la règle apparaît dans la saisie du jour. */
  schedule?: RuleSchedule;
  /** Masquée de l’UI mais conservée pour l’historique des points. */
  deprecated?: boolean;
}

export interface Child {
  id: ChildId;
  name: string;
  currency: string;
  color: string;
}

export interface FamilyTransaction {
  id: string;
  childId: ChildId;
  ruleId: string;
  label: string;
  value: number;
  date: string;
  addedBy: "michael" | "leila";
  createdAt: string;
}
