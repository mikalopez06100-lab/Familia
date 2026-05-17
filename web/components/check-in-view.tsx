"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { formatLocalYmd } from "@/lib/calendar-date";
import { ChildId } from "@/lib/types";
import { ManualBonusForm } from "@/components/manual-bonus-form";
import { useFamilyStore, getChild, getRulesByType } from "@/stores/useFamilyStore";
import { childPlanning, childRoutines } from "@/lib/family-content";

export default function CheckInView({ childId }: { childId: ChildId }) {
  const child = getChild(childId);
  const addRuleTransaction = useFamilyStore((s) => s.addRuleTransaction);
  const removeTransaction = useFamilyStore((s) => s.removeTransaction);
  const dayScore = useFamilyStore((s) => s.dayScore(childId));
  const weekScore = useFamilyStore((s) => s.weekScore(childId));
  const balance = useFamilyStore((s) => s.balance(childId));
  const hasGainToday = useFamilyStore((s) => s.hasGainToday);
  const hasRuleToday = useFamilyStore((s) => s.hasRuleToday);
  const todayStr = formatLocalYmd();
  const todayItems = useFamilyStore((s) =>
    s.transactions
      .filter((t) => t.childId === childId && t.date === todayStr)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  );

  if (!child) return null;

  const gains = getRulesByType(childId, "gain");
  const losses = getRulesByType(childId, "loss");
  const rewards = getRulesByType(childId, "reward");
  const routines = childRoutines[childId];
  const planning = childPlanning[childId];
  const accentClass = childId === "lisandro" ? "from-violet-700 to-violet-500" : "from-teal-700 to-teal-500";
  const accentSoftClass = childId === "lisandro" ? "border-violet-200 bg-violet-50" : "border-teal-200 bg-teal-50";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      <section className="flex flex-wrap gap-2">
        <a href="/" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm">
          ← Accueil
        </a>
        <a href={`/${childId}#routine`} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Routine
        </a>
        <a href={`/${childId}#planning`} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Planning
        </a>
        <a href="/history" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Historique semaine
        </a>
      </section>

      <section className={`rounded-xl border ${accentSoftClass} p-4 shadow-sm`}>
        <h1 className="text-2xl font-bold text-slate-900">{child.name}</h1>
        <p className="text-sm font-medium text-slate-800">Suivi de la journée</p>
        <p className="mt-1 text-sm text-slate-600">
          Tu peux valider gains, pertes et bonus dès que c&apos;est pertinent — pas besoin d&apos;attendre le soir. Un passage le
          soir reste utile pour ce qu&apos;il reste à clôturer.
        </p>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-md bg-white/80 px-2 py-1">Jour: <strong>{dayScore} {child.currency}</strong></div>
          <div className="rounded-md bg-white/80 px-2 py-1">Semaine: <strong>{weekScore} {child.currency}</strong></div>
          <div className="rounded-md bg-white/80 px-2 py-1">Solde: <strong>{balance} {child.currency}</strong></div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="soft-card p-3">
          <h2 className="mb-2 text-sm font-semibold">Gains (toggle)</h2>
          <div className="space-y-2">
            {gains.map((rule) => (
              <button
                key={rule.id}
                onClick={() => addRuleTransaction(rule, childId)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                  hasGainToday(childId, rule.id)
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-emerald-200 bg-emerald-50/60"
                }`}
              >
                <span>{rule.label}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-800">
                  +{rule.value}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="soft-card p-3">
          <h2 className="mb-2 text-sm font-semibold">Pertes (toggle, 1/jour)</h2>
          <div className="space-y-2">
            {losses.map((rule) => (
              <button
                key={rule.id}
                onClick={() => addRuleTransaction(rule, childId)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                  hasRuleToday(childId, rule.id)
                    ? "border-red-500 bg-red-50"
                    : "border-red-200 bg-red-50/60"
                }`}
              >
                <span>{rule.label}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-800">
                  {rule.value}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="soft-card p-3">
          <h2 className="mb-2 text-sm font-semibold">Récompenses (toggle, 1/jour)</h2>
          <div className="space-y-2">
            {rewards.map((rule) => {
              const cost = rule.rewardCost ?? 0;
              const boughtToday = hasRuleToday(childId, rule.id);
              const canBuy = balance >= cost;
              return (
                <button
                  key={rule.id}
                  onClick={() => addRuleTransaction(rule, childId)}
                  disabled={!canBuy && !boughtToday}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm disabled:opacity-50 ${
                    boughtToday ? "border-amber-500 bg-amber-50" : "border-amber-200 bg-amber-50/60"
                  }`}
                >
                  <span>{rule.label}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">
                    -{cost}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <ManualBonusForm childId={childId} />

      <section className="soft-card p-3">
        <h2 className="mb-2 text-sm font-semibold">Historique du jour</h2>
        <div className="space-y-2">
          {todayItems.length === 0 && (
            <p className="text-sm text-neutral-500">Aucune transaction aujourd&apos;hui.</p>
          )}
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
                <button
                  onClick={() => removeTransaction(item.id)}
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div id="routine" className="soft-card scroll-mt-4 p-3">
          <h2 className="mb-2 text-sm font-semibold">Routine quotidienne</h2>
          <ol className="space-y-2 pl-5 text-sm">
            {routines.map((step, index) => (
              <li key={`${childId}-routine-${index}`} className="list-decimal">
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div id="planning" className="soft-card scroll-mt-4 p-3">
          <h2 className="mb-2 text-sm font-semibold">Planning hebdomadaire</h2>
          <div className="space-y-2">
            {planning.map((day) => (
              <div key={`${childId}-${day.day}`} className="rounded-lg border border-neutral-200 p-2">
                <p className="text-sm font-semibold">{day.day}</p>
                <ul className="mt-1 list-disc pl-4 text-xs text-neutral-700">
                  {day.events.map((event) => (
                    <li key={`${childId}-${day.day}-${event}`}>{event}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-2">
        <a href="/" className={`inline-block rounded-lg bg-gradient-to-r px-3 py-2 text-sm text-white ${accentClass}`}>
          Retour à l&apos;accueil
        </a>
      </section>
    </main>
  );
}
