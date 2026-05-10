"use client";

import { create } from "zustand";
import { children, rules } from "@/lib/mock-data";
import { ChildId, FamilyTransaction, Rule } from "@/lib/types";

interface FamilyState {
  transactions: FamilyTransaction[];
  carryovers: Record<string, number>;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addRuleTransaction: (rule: Rule, childId: ChildId) => void;
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

const today = () => new Date().toISOString().slice(0, 10);

const weekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + mondayOffset);
  d.setHours(0, 0, 0, 0);
  return d;
};

const weekKeyFromDate = (date: Date) => weekStart(date).toISOString().slice(0, 10);
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
        transactions: data.transactions ?? [],
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
        (t) => t.childId === childId && t.ruleId === rule.id && t.date === today(),
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
        date: today(),
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
        date: today(),
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
      date: today(),
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
  dayScore: (childId) =>
    Math.max(
      0,
      get()
        .transactions.filter((t) => t.childId === childId && t.date === today())
        .reduce((acc, tx) => acc + tx.value, 0),
    ),
  weekScore: (childId) => {
    const start = weekStart(new Date());
    return Math.max(
      0,
      get()
        .transactions.filter((t) => {
          if (t.childId !== childId) return false;
          const d = new Date(`${t.date}T12:00:00`);
          return d >= start;
        })
        .reduce((acc, tx) => acc + tx.value, 0),
    );
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
      (t) => t.childId === childId && t.ruleId === ruleId && t.date === today() && t.value > 0,
    ),
  weekSummary: (childId, targetDate = new Date()) => {
    const weekKey = weekKeyFromDate(targetDate);
    const start = weekStart(targetDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

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
