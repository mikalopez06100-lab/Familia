"use client";

import Link from "next/link";
import { children } from "@/lib/mock-data";
import { getWeekKey, useFamilyStore } from "@/stores/useFamilyStore";

export default function HistoryPage() {
  const dayMap = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const transactions = useFamilyStore((s) => s.transactions);
  const weekSummary = useFamilyStore((s) => s.weekSummary);
  const carryToNextWeek = useFamilyStore((s) => s.carryToNextWeek);
  const hasCarryoverForWeek = useFamilyStore((s) => s.hasCarryoverForWeek);
  const weekKey = getWeekKey();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h1 className="text-xl font-semibold">Historique semaine</h1>
        <p className="text-sm text-neutral-600">
          Données partagées via Neon (transactions + reports).
        </p>
      </section>

      {children.map((child) => {
        const childTx = transactions.filter((t) => t.childId === child.id);
        const weekStart = new Date(`${weekKey}T00:00:00`);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const summary = weekSummary(child.id);
        const alreadyReported = hasCarryoverForWeek(child.id, weekKey);
        const grouped = dayMap.map((label, i) => {
          const values = childTx.filter((t) => {
            const d = new Date(`${t.date}T12:00:00`);
            return d >= weekStart && d <= weekEnd && d.getDay() === i;
          });
          const total = values.reduce((acc, tx) => acc + tx.value, 0);
          return { label, total };
        });

        return (
          <section key={child.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 font-semibold">{child.name}</h2>
            <div className="mb-3 grid gap-2 text-sm sm:grid-cols-4">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                <p className="text-xs text-neutral-500">Report entrant</p>
                <p className="font-semibold text-emerald-700">{summary.carryIn}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                <p className="text-xs text-neutral-500">Gagné semaine</p>
                <p className="font-semibold text-emerald-700">+{summary.earned}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                <p className="text-xs text-neutral-500">Dépensé semaine</p>
                <p className="font-semibold text-red-700">-{summary.spent}</p>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">
                <p className="text-xs text-neutral-500">Reste à reporter</p>
                <p className="font-semibold">{summary.remaining}</p>
              </div>
            </div>
            <button
              onClick={() => carryToNextWeek(child.id)}
              disabled={alreadyReported}
              className="mb-4 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
            >
              {alreadyReported ? "Report déjà effectué" : "Reporter le non-utilisé à la semaine suivante"}
            </button>
            <div className="grid gap-2 sm:grid-cols-7">
              {grouped.map((d) => (
                <div key={d.label} className="rounded-lg border border-neutral-200 p-2 text-center">
                  <p className="text-xs text-neutral-500">{d.label}</p>
                  <p className={`text-sm font-semibold ${d.total < 0 ? "text-red-700" : "text-emerald-700"}`}>
                    {d.total > 0 ? `+${d.total}` : d.total}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <Link href="/" className="text-sm text-neutral-600 underline">
        Retour dashboard
      </Link>
    </main>
  );
}
