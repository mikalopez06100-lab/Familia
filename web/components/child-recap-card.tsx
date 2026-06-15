"use client";

import { children } from "@/lib/mock-data";
import { ChildId } from "@/lib/types";
import { getWeekKey, useFamilyStore } from "@/stores/useFamilyStore";

export default function ChildRecapCard({ childId, readOnly = false }: { childId: ChildId; readOnly?: boolean }) {
  const child = children.find((c) => c.id === childId);
  const transactions = useFamilyStore((s) => s.transactions);
  const dayScore = useFamilyStore((s) => s.dayScore(childId));
  const weekScore = useFamilyStore((s) => s.weekScore(childId));
  const balance = useFamilyStore((s) => s.balance(childId));
  const weekSummary = useFamilyStore((s) => s.weekSummary);
  const carryToNextWeek = useFamilyStore((s) => s.carryToNextWeek);
  const hasCarryoverForWeek = useFamilyStore((s) => s.hasCarryoverForWeek);

  if (!child) return null;

  const weekKey = getWeekKey();
  const summary = weekSummary(childId);
  const alreadyReported = hasCarryoverForWeek(childId, weekKey);
  const accentBorder = childId === "lisandro" ? "border-violet-200" : "border-teal-200";
  const accentBg = childId === "lisandro" ? "bg-violet-50/50" : "bg-teal-50/50";
  const accentTitle = childId === "lisandro" ? "text-violet-900" : "text-teal-900";

  void transactions;

  return (
    <div className={`rounded-xl border ${accentBorder} ${accentBg} p-3`}>
      <h2 className={`text-lg font-bold ${accentTitle}`}>{child.name}</h2>
      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-md bg-white/90 px-2 py-1.5">
          Jour : <strong>{dayScore}</strong> {child.currency}
        </div>
        <div className="rounded-md bg-white/90 px-2 py-1.5">
          Semaine : <strong>{weekScore}</strong> {child.currency}
        </div>
        <div className="rounded-md bg-white/90 px-2 py-1.5">
          Solde : <strong>{balance}</strong> {child.currency}
        </div>
      </div>
      <div className="mt-2 grid gap-1.5 text-xs sm:grid-cols-4">
        <div className="rounded-md border border-neutral-200/80 bg-white/80 px-2 py-1">
          Report : <strong>{summary.carryIn}</strong>
        </div>
        <div className="rounded-md border border-neutral-200/80 bg-white/80 px-2 py-1">
          Gagné : <strong className="text-emerald-700">+{summary.earned}</strong>
        </div>
        <div className="rounded-md border border-neutral-200/80 bg-white/80 px-2 py-1">
          Dépensé : <strong className="text-red-700">-{summary.spent}</strong>
        </div>
        <div className="rounded-md border border-neutral-200/80 bg-white/80 px-2 py-1">
          Reste : <strong>{summary.remaining}</strong>
        </div>
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={() => carryToNextWeek(childId)}
          disabled={alreadyReported}
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-xs disabled:opacity-50"
        >
          {alreadyReported ? "Report déjà effectué" : "Reporter le non-utilisé"}
        </button>
      )}
    </div>
  );
}
