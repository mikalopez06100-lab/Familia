export type ChildId = "lisandro" | "mila";
export type RuleType = "gain" | "loss" | "reward";

export interface Rule {
  id: string;
  childId: ChildId;
  label: string;
  value: number;
  type: RuleType;
  rewardCost?: number;
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
