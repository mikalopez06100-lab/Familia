"use client";

import Link from "next/link";
import { ChildId } from "@/lib/types";
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
  const today = new Date().toISOString().slice(0, 10);
  const todayItems = useFamilyStore((s) =>
    s.transactions
      .filter((t) => t.childId === childId && t.date === today)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
  );

  if (!child) return null;

  const gains = getRulesByType(childId, "gain");
  const losses = getRulesByType(childId, "loss");
  const rewards = getRulesByType(childId, "reward");
  const routines = childRoutines[childId];
  const planning = childPlanning[childId];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      <section className="flex flex-wrap gap-2">
        <Link href="/" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          ← Accueil
        </Link>
        <Link href={`/${childId}#routine`} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Routine
        </Link>
        <Link href={`/${childId}#planning`} className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Planning
        </Link>
        <Link href="/history" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Historique semaine
        </Link>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h1 className="text-xl font-semibold">{child.name}</h1>
        <p className="text-sm text-neutral-500">Check-in quotidien</p>
        <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div>Jour: <strong>{dayScore} {child.currency}</strong></div>
          <div>Semaine: <strong>{weekScore} {child.currency}</strong></div>
          <div>Solde: <strong>{balance} {child.currency}</strong></div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-3">
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

        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <h2 className="mb-2 text-sm font-semibold">Pertes (multiples)</h2>
          <div className="space-y-2">
            {losses.map((rule) => (
              <button
                key={rule.id}
                onClick={() => addRuleTransaction(rule, childId)}
                className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-left text-sm"
              >
                <span>{rule.label}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-800">
                  {rule.value}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-3">
          <h2 className="mb-2 text-sm font-semibold">Récompenses</h2>
          <div className="space-y-2">
            {rewards.map((rule) => {
              const cost = rule.rewardCost ?? 0;
              const canBuy = balance >= cost;
              return (
                <button
                  key={rule.id}
                  onClick={() => addRuleTransaction(rule, childId)}
                  disabled={!canBuy}
                  className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-left text-sm disabled:opacity-50"
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

      <section className="rounded-xl border border-neutral-200 bg-white p-3">
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
        <div id="routine" className="rounded-xl border border-neutral-200 bg-white p-3 scroll-mt-4">
          <h2 className="mb-2 text-sm font-semibold">Routine quotidienne</h2>
          <ol className="space-y-2 pl-5 text-sm">
            {routines.map((step, index) => (
              <li key={`${childId}-routine-${index}`} className="list-decimal">
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div id="planning" className="rounded-xl border border-neutral-200 bg-white p-3 scroll-mt-4">
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
        <Link href="/" className="inline-block rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white">
          Retour à l&apos;accueil
        </Link>
      </section>
    </main>
  );
}
