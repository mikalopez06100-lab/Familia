"use client";

import { create } from "zustand";
import { formatLocalYmd, toDateKey } from "@/lib/calendar-date";
import { children, rules } from "@/lib/mock-data";
import { ChildId, FamilyTransaction, Rule } from "@/lib/types";

/** Transactions bonus manuel (hors règles prédéfinies) — plusieurs par jour possibles. */
export const MANUAL_BONUS_RULE_ID = "manual_bonus";

interface FamilyState {
  transactions: FamilyTransaction[];
  carryovers: Record<string, number>;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addRuleTransaction: (rule: Rule, childId: ChildId) => void;
  addManualBonus: (childId: ChildId, reason: string, amount: number) => void;
  removeTransaction: (id: string) => void;
  dayScore: (childId: ChildId) => number;
  weekScore: (childId: ChildId) => number;
  balance: (childId: ChildId) => number;
  hasGainToday: (childId: ChildId, ruleId: string) => boolean;
  weekSummary: (
    childId: ChildId,
    targetDate?: Date,
  ) => {
    weekKey: string;
    earned: number;
    spent: number;
    carryIn: number;
    remaining: number;
  };
  carryToNextWeek: (childId: ChildId, targetDate?: Date) => void;
  hasCarryoverForWeek: (childId: ChildId, weekKey: string) => boolean;
}

const weekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
};

const weekEnd = (date: Date) => {
  const start = weekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

/** Clé de semaine = lundi (date locale YYYY-MM-DD), cohérente avec les reports. */
const weekKeyFromDate = (date: Date) => formatLocalYmd(weekStart(date));
const keyFor = (childId: ChildId, weekKey: string) => `${childId}:${weekKey}`;
const uid = () => crypto.randomUUID();

export const useFamilyStore = create<FamilyState>((set, get) => ({
  transactions: [],
  carryovers: {},
  initialized: false,
  loading: false,
  error: null,
  initialize: async () => {
    if (get().initialized || get().loading) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Impossible de lire l'état distant");
      }
      const data = await res.json();
      set({
        transactions: (data.transactions ?? []).map((t: FamilyTransaction) => ({
          ...t,
          date: toDateKey(t.date) || t.date,
        })),
        carryovers: data.carryovers ?? {},
        initialized: true,
        loading: false,
      });
    } catch (error) {
      set({
        error: String(error),
        loading: false,
      });
    }
  },
  addRuleTransaction: (rule, childId) => {
    if (rule.type === "gain" && get().hasGainToday(childId, rule.id)) {
      const existing = get().transactions.find(
        (t) => t.childId === childId && t.ruleId === rule.id && t.date === formatLocalYmd(),
      );
      if (existing) {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== existing.id),
        }));
        fetch(`/api/transactions?id=${existing.id}`, { method: "DELETE" }).catch(() => null);
      }
      return;
    }

    if (rule.type === "reward") {
      const cost = rule.rewardCost ?? 0;
      if (get().balance(childId) < cost) {
        return;
      }
      const tx: FamilyTransaction = {
        id: uid(),
        childId,
        ruleId: rule.id,
        label: `Rachat: ${rule.label}`,
        value: -cost,
        date: formatLocalYmd(),
        addedBy: "michael",
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        transactions: [...state.transactions, tx],
      }));
      fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      }).catch(() => null);
      return;
    }

    if (rule.type === "loss") {
      const current = get().balance(childId);
      const next = Math.max(0, current + rule.value);
      const applied = next - current;
      if (applied === 0) return;
      const tx: FamilyTransaction = {
        id: uid(),
        childId,
        ruleId: rule.id,
        label: rule.label,
        value: applied,
        date: formatLocalYmd(),
        addedBy: "michael",
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        transactions: [...state.transactions, tx],
      }));
      fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx),
      }).catch(() => null);
      return;
    }

    const tx: FamilyTransaction = {
      id: uid(),
      childId,
      ruleId: rule.id,
      label: rule.label,
      value: rule.value,
      date: formatLocalYmd(),
      addedBy: "michael",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      transactions: [...state.transactions, tx],
    }));
    fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    }).catch(() => null);
  },
  addManualBonus: (childId, reason, amount) => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    const value = Math.min(50, Math.max(1, Math.floor(amount)));
    const tx: FamilyTransaction = {
      id: uid(),
      childId,
      ruleId: MANUAL_BONUS_RULE_ID,
      label: `Bonus: ${trimmed}`,
      value,
      date: formatLocalYmd(),
      addedBy: "michael",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      transactions: [...state.transactions, tx],
    }));
    fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tx),
    }).catch(() => null);
  },
  removeTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }));
    fetch(`/api/transactions?id=${id}`, { method: "DELETE" }).catch(() => null);
  },
  /** Net des transactions du jour local (comme les cases « Lun … Dim » de l’historique). */
  dayScore: (childId) => {
    const day = formatLocalYmd();
    return get()
      .transactions.filter((t) => t.childId === childId && t.date === day)
      .reduce((acc, tx) => acc + tx.value, 0);
  },
  /** Net de la semaine civile locale (lundi → dimanche), même périmètre que weekSummary hors report. */
  weekScore: (childId) => {
    const now = new Date();
    const start = weekStart(now);
    const end = weekEnd(now);
    return get()
      .transactions.filter((t) => {
        if (t.childId !== childId) return false;
        const d = new Date(`${t.date}T12:00:00`);
        return d >= start && d <= end;
      })
      .reduce((acc, tx) => acc + tx.value, 0);
  },
  balance: (childId) =>
    Math.max(
      0,
      get()
        .transactions.filter((t) => t.childId === childId)
        .reduce((acc, tx) => acc + tx.value, 0),
    ),
  hasGainToday: (childId, ruleId) =>
    get().transactions.some(
      (t) => t.childId === childId && t.ruleId === ruleId && t.date === formatLocalYmd() && t.value > 0,
    ),
  weekSummary: (childId, targetDate = new Date()) => {
    const weekKey = weekKeyFromDate(targetDate);
    const start = weekStart(targetDate);
    const end = weekEnd(targetDate);

    const tx = get().transactions.filter((t) => {
      if (t.childId !== childId) return false;
      const d = new Date(`${t.date}T12:00:00`);
      return d >= start && d <= end;
    });

    const earned = tx.filter((t) => t.value > 0).reduce((acc, t) => acc + t.value, 0);
    const spent = Math.abs(tx.filter((t) => t.value < 0).reduce((acc, t) => acc + t.value, 0));

    const prevWeek = new Date(start);
    prevWeek.setDate(prevWeek.getDate() - 7);
    const prevKey = weekKeyFromDate(prevWeek);
    const carryIn = get().carryovers[keyFor(childId, prevKey)] ?? 0;
    const remaining = Math.max(0, carryIn + earned - spent);

    return { weekKey, earned, spent, carryIn, remaining };
  },
  carryToNextWeek: (childId, targetDate = new Date()) => {
    const summary = get().weekSummary(childId, targetDate);
    const index = keyFor(childId, summary.weekKey);
    if (get().carryovers[index] !== undefined) return;

    fetch("/api/carryovers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        weekKey: summary.weekKey,
        amount: summary.remaining,
      }),
    }).catch(() => null);

    set((state) => ({
      carryovers: {
        ...state.carryovers,
        [index]: summary.remaining,
      },
    }));
  },
  hasCarryoverForWeek: (childId, weekKey) => get().carryovers[keyFor(childId, weekKey)] !== undefined,
}));

export const getChild = (childId: ChildId) => children.find((c) => c.id === childId);
export const getRulesByType = (childId: ChildId, type: Rule["type"]) =>
  rules.filter((r) => r.childId === childId && r.type === type);
export const getWeekKey = (date = new Date()) => weekKeyFromDate(date);
