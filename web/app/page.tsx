"use client";

import { useMemo, useState } from "react";
import { childPlanning, childRoutines } from "@/lib/family-content";
import { children, rules } from "@/lib/mock-data";
import { ChildId } from "@/lib/types";
import { useFamilyStore } from "@/stores/useFamilyStore";

const today = new Date().toISOString().slice(0, 10);

export default function Home() {
  const [activeChildId, setActiveChildId] = useState<ChildId>("lisandro");
  const transactions = useFamilyStore((s) => s.transactions);
  const addRuleTransaction = useFamilyStore((s) => s.addRuleTransaction);
  const removeTransaction = useFamilyStore((s) => s.removeTransaction);
  const dayScore = useFamilyStore((s) => s.dayScore(activeChildId));
  const weekScore = useFamilyStore((s) => s.weekScore(activeChildId));
  const balance = useFamilyStore((s) => s.balance(activeChildId));
  const hasGainToday = useFamilyStore((s) => s.hasGainToday);
  const weekSummary = useFamilyStore((s) => s.weekSummary);
  const carryToNextWeek = useFamilyStore((s) => s.carryToNextWeek);
  const hasCarryoverForWeek = useFamilyStore((s) => s.hasCarryoverForWeek);

  const activeChild = children.find((c) => c.id === activeChildId) ?? children[0];
  const routines = childRoutines[activeChildId];
  const planning = childPlanning[activeChildId];
  const weekKey = new Date(new Date().setHours(0, 0, 0, 0)).toISOString().slice(0, 10);

  const gains = rules.filter((r) => r.childId === activeChildId && r.type === "gain");
  const losses = rules.filter((r) => r.childId === activeChildId && r.type === "loss");
  const rewards = rules.filter((r) => r.childId === activeChildId && r.type === "reward");

  const todayItems = useMemo(
    () =>
      transactions
        .filter((t) => t.childId === activeChildId && t.date === today)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [activeChildId, transactions],
  );

  const rewardTx = transactions
    .filter((t) => t.childId === activeChildId && t.label.startsWith("Rachat:"))
    .slice(0, 8);

  const summary = weekSummary(activeChildId);
  const alreadyReported = hasCarryoverForWeek(activeChildId, weekKey);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      <section className="soft-card p-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard famille (mode mono-page)</h1>
        <p className="text-sm text-slate-600">Tout est accessible ici sans changer de page.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setActiveChildId(child.id)}
              className={`rounded-lg px-3 py-2 text-sm ${
                activeChildId === child.id
                  ? child.id === "lisandro"
                    ? "bg-violet-700 text-white"
                    : "bg-teal-700 text-white"
                  : "border border-neutral-300 bg-white"
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      </section>

      <section className="soft-card p-4">
        <h2 className="text-xl font-semibold">{activeChild.name}</h2>
        <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-md bg-white/80 px-2 py-1">Jour: <strong>{dayScore} {activeChild.currency}</strong></div>
          <div className="rounded-md bg-white/80 px-2 py-1">Semaine: <strong>{weekScore} {activeChild.currency}</strong></div>
          <div className="rounded-md bg-white/80 px-2 py-1">Solde: <strong>{balance} {activeChild.currency}</strong></div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="soft-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Gains (toggle)</h3>
          <div className="space-y-2">
            {gains.map((rule) => (
              <button
                key={rule.id}
                onClick={() => addRuleTransaction(rule, activeChildId)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                  hasGainToday(activeChildId, rule.id)
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-emerald-200 bg-emerald-50/60"
                }`}
              >
                <span>{rule.label}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">+{rule.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="soft-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Pertes (multiples)</h3>
          <div className="space-y-2">
            {losses.map((rule) => (
              <button
                key={rule.id}
                onClick={() => addRuleTransaction(rule, activeChildId)}
                className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-left text-sm"
              >
                <span>{rule.label}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-800">{rule.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="soft-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Récompenses</h3>
          <div className="space-y-2">
            {rewards.map((rule) => {
              const cost = rule.rewardCost ?? 0;
              return (
                <button
                  key={rule.id}
                  onClick={() => addRuleTransaction(rule, activeChildId)}
                  disabled={balance < cost}
                  className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-left text-sm disabled:opacity-50"
                >
                  <span>{rule.label}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">-{cost}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="soft-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Routine quotidienne</h3>
          <ol className="space-y-2 pl-5 text-sm">
            {routines.map((step, idx) => (
              <li key={`${activeChildId}-r-${idx}`} className="list-decimal">{step}</li>
            ))}
          </ol>
        </div>
        <div className="soft-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Planning hebdomadaire</h3>
          <div className="space-y-2">
            {planning.map((day) => (
              <div key={`${activeChildId}-${day.day}`} className="rounded-lg border border-neutral-200 p-2">
                <p className="text-sm font-semibold">{day.day}</p>
                <ul className="mt-1 list-disc pl-4 text-xs text-neutral-700">
                  {day.events.map((event) => (
                    <li key={`${day.day}-${event}`}>{event}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="soft-card p-3">
        <h3 className="mb-2 text-sm font-semibold">Récap semaine</h3>
        <div className="mb-2 grid gap-2 text-sm sm:grid-cols-4">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">Report entrant: <strong>{summary.carryIn}</strong></div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">Gagné: <strong>+{summary.earned}</strong></div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">Dépensé: <strong>-{summary.spent}</strong></div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2">Reste: <strong>{summary.remaining}</strong></div>
        </div>
        <button
          onClick={() => carryToNextWeek(activeChildId)}
          disabled={alreadyReported}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
        >
          {alreadyReported ? "Report déjà effectué" : "Reporter le non-utilisé à la semaine suivante"}
        </button>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="soft-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Historique du jour</h3>
          <div className="space-y-2">
            {todayItems.length === 0 && <p className="text-sm text-neutral-500">Aucune transaction aujourd&apos;hui.</p>}
            {todayItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-2 text-sm">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(item.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} · {item.addedBy}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.value > 0 ? `+${item.value}` : item.value}</span>
                  <button onClick={() => removeTransaction(item.id)} className="rounded-md border border-neutral-300 px-2 py-1 text-xs">
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Récompenses rachetées</h3>
          <div className="space-y-2">
            {rewardTx.length === 0 && <p className="text-sm text-neutral-500">Aucun rachat.</p>}
            {rewardTx.map((r) => (
              <div key={r.id} className="rounded-lg border border-neutral-200 p-2 text-sm">
                <p className="font-medium">{r.label}</p>
                <p className="text-xs text-neutral-500">{new Date(r.createdAt).toLocaleString("fr-FR")} · {r.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="soft-card p-3">
        <h3 className="mb-3 text-sm font-semibold">Toutes les règles (Lisandro + Mila)</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {children.map((child) => {
            const childGains = rules.filter((r) => r.childId === child.id && r.type === "gain");
            const childLosses = rules.filter((r) => r.childId === child.id && r.type === "loss");
            const childRewards = rules.filter((r) => r.childId === child.id && r.type === "reward");
            return (
              <div key={`all-rules-${child.id}`} className="rounded-lg border border-neutral-200 bg-white p-3">
                <h4 className="mb-2 text-sm font-semibold">{child.name}</h4>

                <p className="mb-1 text-xs font-semibold text-emerald-700">Gains</p>
                <ul className="mb-3 space-y-1 text-xs text-neutral-700">
                  {childGains.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 rounded border border-emerald-100 bg-emerald-50 px-2 py-1">
                      <span>{r.label}</span>
                      <span className="font-semibold">+{r.value}</span>
                    </li>
                  ))}
                </ul>

                <p className="mb-1 text-xs font-semibold text-red-700">Pertes</p>
                <ul className="mb-3 space-y-1 text-xs text-neutral-700">
                  {childLosses.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 rounded border border-red-100 bg-red-50 px-2 py-1">
                      <span>{r.label}</span>
                      <span className="font-semibold">{r.value}</span>
                    </li>
                  ))}
                </ul>

                <p className="mb-1 text-xs font-semibold text-amber-700">Récompenses</p>
                <ul className="space-y-1 text-xs text-neutral-700">
                  {childRewards.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 rounded border border-amber-100 bg-amber-50 px-2 py-1">
                      <span>{r.label}</span>
                      <span className="font-semibold">-{r.rewardCost ?? 0}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
