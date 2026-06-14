"use client";

import { useMemo, useState } from "react";
import { childPlanning, childRoutines } from "@/lib/family-content";
import { children, rules } from "@/lib/mock-data";
import ChildRecapCard from "@/components/child-recap-card";
import DayContextBanner from "@/components/day-context-banner";
import FamilyCalendar from "@/components/family-calendar";
import { ManualBonusForm } from "@/components/manual-bonus-form";
import ScreenTimeRules from "@/components/screen-time-rules";
import SpendingRecap from "@/components/spending-recap";
import { formatLocalYmd } from "@/lib/calendar-date";
import { filterAvailableRules, scheduleLabel } from "@/lib/rule-availability";
import { ChildId } from "@/lib/types";
import { useFamilyStore } from "@/stores/useFamilyStore";

export default function Home() {
  const [activeChildId, setActiveChildId] = useState<ChildId>("lisandro");
  const transactions = useFamilyStore((s) => s.transactions);
  const addRuleTransaction = useFamilyStore((s) => s.addRuleTransaction);
  const removeTransaction = useFamilyStore((s) => s.removeTransaction);
  const hasGainToday = useFamilyStore((s) => s.hasGainToday);
  const hasRuleToday = useFamilyStore((s) => s.hasRuleToday);
  const balance = useFamilyStore((s) => s.balance(activeChildId));
  const activeChild = children.find((c) => c.id === activeChildId) ?? children[0];
  const routines = childRoutines[activeChildId];
  const planning = childPlanning[activeChildId];
  const todayStr = formatLocalYmd();
  const gains = useMemo(() => filterAvailableRules(rules, activeChildId, "gain"), [activeChildId]);
  const losses = useMemo(() => filterAvailableRules(rules, activeChildId, "loss"), [activeChildId]);
  const rewards = useMemo(() => filterAvailableRules(rules, activeChildId, "reward"), [activeChildId]);

  const todayItems = useMemo(
    () =>
      transactions
        .filter((t) => t.childId === activeChildId && t.date === todayStr)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [activeChildId, transactions, todayStr],
  );

  const navLinks = [
    { href: "#recap", label: "Récap" },
    { href: "#agenda", label: "Agenda" },
    { href: "#saisie", label: "Saisie" },
    { href: "#routine", label: "Routine" },
    { href: "#depenses", label: "Dépenses" },
    { href: "#historique", label: "Historique" },
    { href: "#regles", label: "Règles" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 pb-28">
      <header className="soft-card p-4">
        <h1 className="text-2xl font-bold tracking-wide text-slate-900">LOPEZ FAMILIA</h1>
        <nav className="mt-3 flex flex-wrap gap-1.5" aria-label="Sections de la page">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-neutral-50"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <section id="recap" className="mt-4 scroll-mt-4">
          <div className="grid gap-3 md:grid-cols-2">
            {children.map((child) => (
              <ChildRecapCard key={child.id} childId={child.id} />
            ))}
          </div>
        </section>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-200/80 pt-3">
          <span className="text-xs font-medium text-neutral-500">Saisie pour :</span>
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
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
      </header>

      <section id="saisie" className="scroll-mt-4 grid gap-3 md:grid-cols-3">
        <div className="md:col-span-3">
          <DayContextBanner childId={activeChildId} />
        </div>
        <p className="text-sm font-semibold text-slate-700 md:col-span-3">{activeChild.name} — règles du jour</p>
        <div className="soft-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Gains (toggle)</h3>
          <div className="space-y-2">
            {gains.map((rule) => (
              <button
                key={rule.id}
                type="button"
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
          <h3 className="mb-2 text-sm font-semibold">Pertes (toggle, 1/jour)</h3>
          <div className="space-y-2">
            {losses.map((rule) => (
              <button
                key={rule.id}
                type="button"
                onClick={() => addRuleTransaction(rule, activeChildId)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                  hasRuleToday(activeChildId, rule.id)
                    ? "border-red-500 bg-red-50"
                    : "border-red-200 bg-red-50/60"
                }`}
              >
                <span>{rule.label}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-800">{rule.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="soft-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Récompenses (toggle, 1/jour)</h3>
          <div className="space-y-2">
            {rewards.map((rule) => {
              const cost = rule.rewardCost ?? 0;
              const boughtToday = hasRuleToday(activeChildId, rule.id);
              return (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => addRuleTransaction(rule, activeChildId)}
                  disabled={balance < cost && !boughtToday}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm disabled:opacity-50 ${
                    boughtToday ? "border-amber-500 bg-amber-50" : "border-amber-200 bg-amber-50/60"
                  }`}
                >
                  <span>{rule.label}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">-{cost}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <ManualBonusForm childId={activeChildId} />

      <section id="routine" className="scroll-mt-4 grid gap-3 md:grid-cols-2">
        <div className="soft-card p-3">
          <h3 className="mb-2 text-sm font-semibold">Routine quotidienne</h3>
          <ol className="space-y-2 pl-5 text-sm">
            {routines.map((step, idx) => (
              <li key={`${activeChildId}-r-${idx}`} className="list-decimal">
                {step}
              </li>
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

        <ScreenTimeRules childId={activeChildId} />
        <FamilyCalendar childId={activeChildId} />
      </section>

      <SpendingRecap limit={12} />

      <section id="historique" className="soft-card scroll-mt-4 p-3">
        <h3 className="mb-2 text-sm font-semibold">Historique du jour — {activeChild.name}</h3>
          <div className="space-y-2">
            {todayItems.length === 0 && <p className="text-sm text-neutral-500">Aucune transaction aujourd&apos;hui.</p>}
            {todayItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-2 text-sm">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(item.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                    {item.addedBy}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{item.value > 0 ? `+${item.value}` : item.value}</span>
                  <button
                    type="button"
                    onClick={() => removeTransaction(item.id)}
                    className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        <p className="mt-2 text-xs text-neutral-500">
          <a href="#depenses" className="underline">
            Voir le récap des dépenses avec dates
          </a>
        </p>
      </section>

      <section id="regles" className="soft-card scroll-mt-4 p-3">
        <h3 className="mb-3 text-sm font-semibold">Toutes les règles (Lisandro + Mila)</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {children.map((child) => {
            const childGains = rules.filter((r) => r.childId === child.id && r.type === "gain" && !r.deprecated);
            const childLosses = rules.filter((r) => r.childId === child.id && r.type === "loss" && !r.deprecated);
            const childRewards = rules.filter((r) => r.childId === child.id && r.type === "reward" && !r.deprecated);
            return (
              <div key={`all-rules-${child.id}`} className="rounded-lg border border-neutral-200 bg-white p-3">
                <h4 className="mb-2 text-sm font-semibold">{child.name}</h4>

                <p className="mb-1 text-xs font-semibold text-emerald-700">Gains</p>
                <ul className="mb-3 space-y-1 text-xs text-neutral-700">
                  {childGains.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded border border-emerald-100 bg-emerald-50 px-2 py-1"
                    >
                      <span>
                        {r.label}
                        {r.schedule && r.schedule !== "always" && (
                          <span className="mt-0.5 block text-[10px] font-normal text-neutral-500">
                            {scheduleLabel(r.schedule)}
                          </span>
                        )}
                      </span>
                      <span className="font-semibold">+{r.value}</span>
                    </li>
                  ))}
                </ul>

                <p className="mb-1 text-xs font-semibold text-red-700">Pertes</p>
                <ul className="mb-3 space-y-1 text-xs text-neutral-700">
                  {childLosses.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded border border-red-100 bg-red-50 px-2 py-1"
                    >
                      <span>
                        {r.label}
                        {r.schedule && r.schedule !== "always" && (
                          <span className="mt-0.5 block text-[10px] font-normal text-neutral-500">
                            {scheduleLabel(r.schedule)}
                          </span>
                        )}
                      </span>
                      <span className="font-semibold">{r.value}</span>
                    </li>
                  ))}
                </ul>

                <p className="mb-1 text-xs font-semibold text-amber-700">Récompenses</p>
                <ul className="space-y-1 text-xs text-neutral-700">
                  {childRewards.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-2 rounded border border-amber-100 bg-amber-50 px-2 py-1"
                    >
                      <span>
                        {r.label}
                        {r.schedule && r.schedule !== "always" && (
                          <span className="mt-0.5 block text-[10px] font-normal text-neutral-500">
                            {scheduleLabel(r.schedule)}
                          </span>
                        )}
                      </span>
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
