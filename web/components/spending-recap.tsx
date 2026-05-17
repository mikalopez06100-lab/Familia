"use client";

import { useMemo } from "react";
import { children } from "@/lib/mock-data";
import { ChildId } from "@/lib/types";
import { useFamilyStore } from "@/stores/useFamilyStore";

function formatDateLabel(ymd: string) {
  const d = new Date(`${ymd}T12:00:00`);
  return d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function spendingKind(label: string) {
  if (label.startsWith("Rachat:")) return "Récompense";
  return "Perte";
}

export default function SpendingRecap({
  childId,
  limit,
}: {
  childId?: ChildId;
  /** Limite par enfant (undefined = tout l’historique). */
  limit?: number;
}) {
  const transactions = useFamilyStore((s) => s.transactions);

  const byChild = useMemo(() => {
    const targets = childId ? children.filter((c) => c.id === childId) : children;
    return targets.map((child) => {
      const rows = transactions
        .filter((t) => t.childId === child.id && t.value < 0)
        .sort((a, b) => {
          const dateCmp = b.date.localeCompare(a.date);
          if (dateCmp !== 0) return dateCmp;
          return +new Date(b.createdAt) - +new Date(a.createdAt);
        });
      const shown = limit !== undefined ? rows.slice(0, limit) : rows;
      const totalSpent = rows.reduce((acc, t) => acc + Math.abs(t.value), 0);
      return { child, rows: shown, total: rows.length, totalSpent };
    });
  }, [transactions, childId, limit]);

  return (
    <section className="soft-card p-3">
      <h3 className="mb-1 text-sm font-semibold">Points / étoiles dépensés</h3>
      <p className="mb-3 text-xs text-neutral-600">Récompenses rachetées et pertes enregistrées, avec la date du jour.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {byChild.map(({ child, rows, total, totalSpent }) => {
          const accent =
            child.id === "lisandro"
              ? "border-violet-200 bg-violet-50/40"
              : "border-teal-200 bg-teal-50/40";
          return (
            <div key={child.id} className={`rounded-xl border p-3 ${accent}`}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-semibold text-slate-900">{child.name}</h4>
                <p className="text-xs text-neutral-600">
                  Total dépensé : <strong className="text-red-700">-{totalSpent}</strong> {child.currency}
                  {limit !== undefined && total > limit ? ` · ${total} au total` : ""}
                </p>
              </div>
              {rows.length === 0 ? (
                <p className="text-sm text-neutral-500">Aucune dépense enregistrée.</p>
              ) : (
                <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {rows.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-start justify-between gap-2 rounded-lg border border-neutral-200/80 bg-white/90 px-2 py-1.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-500">{formatDateLabel(t.date)}</p>
                        <p className="font-medium leading-snug">{t.label.replace(/^Rachat:\s*/, "")}</p>
                        <p className="text-xs text-neutral-500">
                          {spendingKind(t.label)}
                          {" · "}
                          {new Date(t.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-red-700">{t.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
