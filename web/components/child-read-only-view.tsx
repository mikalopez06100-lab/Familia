"use client";

import { useMemo } from "react";
import { childPlanning, childRoutines } from "@/lib/family-content";
import { rules } from "@/lib/mock-data";
import ChildRecapCard from "@/components/child-recap-card";
import DayContextBanner from "@/components/day-context-banner";
import FamilyCalendar from "@/components/family-calendar";
import ScreenTimeRules from "@/components/screen-time-rules";
import { formatLocalYmd } from "@/lib/calendar-date";
import { scheduleLabel } from "@/lib/rule-availability";
import { ChildId } from "@/lib/types";
import { getChild, useFamilyStore } from "@/stores/useFamilyStore";

export default function ChildReadOnlyView({ childId }: { childId: ChildId }) {
  const child = getChild(childId);
  const transactions = useFamilyStore((s) => s.transactions);
  const todayStr = formatLocalYmd();

  const todayItems = useMemo(
    () =>
      transactions
        .filter((t) => t.childId === childId && t.date === todayStr)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [childId, transactions, todayStr],
  );

  const childRules = useMemo(
    () => ({
      gains: rules.filter((r) => r.childId === childId && r.type === "gain" && !r.deprecated),
      losses: rules.filter((r) => r.childId === childId && r.type === "loss" && !r.deprecated),
      rewards: rules.filter((r) => r.childId === childId && r.type === "reward" && !r.deprecated),
    }),
    [childId],
  );

  if (!child) return null;

  const routines = childRoutines[childId];
  const planning = childPlanning[childId];
  const accentClass = childId === "lisandro" ? "from-violet-700 to-violet-500" : "from-teal-700 to-teal-500";
  const accentSoft = childId === "lisandro" ? "border-violet-200 bg-violet-50" : "border-teal-200 bg-teal-50";

  const navLinks = [
    { href: "#recap", label: "Points" },
    { href: "#aujourdhui", label: "Aujourd'hui" },
    { href: "#routine", label: "Routine" },
    { href: "#ecrans", label: "Écrans" },
    { href: "#agenda", label: "Agenda" },
    { href: "#regles", label: "Règles" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 pb-28">
      <header className={`rounded-xl border ${accentSoft} p-4 shadow-sm`}>
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Consultation seule</p>
        <h1 className="text-2xl font-bold text-slate-900">{child.name}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Suis tes points, ta routine et tes règles. Seuls tes parents peuvent ajouter ou dépenser des {child.currency}.
        </p>
        <nav className="mt-3 flex flex-wrap gap-1.5" aria-label="Sections">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </header>

      <section id="recap" className="scroll-mt-4">
        <ChildRecapCard childId={childId} readOnly />
      </section>

      <DayContextBanner childId={childId} />

      <section id="aujourdhui" className="soft-card scroll-mt-4 p-3">
        <h2 className="mb-2 text-sm font-semibold">Mon jour</h2>
        <div className="space-y-2">
          {todayItems.length === 0 && (
            <p className="text-sm text-neutral-500">Rien de noté pour aujourd&apos;hui pour l&apos;instant.</p>
          )}
          {todayItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-lg border border-neutral-200 p-2 text-sm">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-neutral-500">
                  {new Date(item.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className={`font-semibold ${item.value > 0 ? "text-emerald-700" : "text-red-700"}`}>
                {item.value > 0 ? `+${item.value}` : item.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section id="routine" className="scroll-mt-4 grid gap-3">
        <div className="soft-card p-3">
          <h2 className="mb-2 text-sm font-semibold">Routine quotidienne</h2>
          <ol className="space-y-2 pl-5 text-sm">
            {routines.map((step, idx) => (
              <li key={`${childId}-r-${idx}`} className="list-decimal">
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="soft-card p-3">
          <h2 className="mb-2 text-sm font-semibold">Planning de la semaine</h2>
          <div className="space-y-2">
            {planning.map((day) => (
              <div key={`${childId}-${day.day}`} className="rounded-lg border border-neutral-200 p-2">
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

      <ScreenTimeRules childId={childId} />
      <FamilyCalendar childId={childId} />

      <section id="regles" className="soft-card scroll-mt-4 p-3">
        <h2 className="mb-3 text-sm font-semibold">Mes règles</h2>

        <p className="mb-1 text-xs font-semibold text-emerald-700">Gains possibles</p>
        <ul className="mb-3 space-y-1 text-xs text-neutral-700">
          {childRules.gains.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded border border-emerald-100 bg-emerald-50 px-2 py-1"
            >
              <span>
                {r.label}
                {r.schedule && r.schedule !== "always" && (
                  <span className="mt-0.5 block text-[10px] font-normal text-neutral-500">{scheduleLabel(r.schedule)}</span>
                )}
              </span>
              <span className="font-semibold">+{r.value}</span>
            </li>
          ))}
        </ul>

        <p className="mb-1 text-xs font-semibold text-red-700">Pertes possibles</p>
        <ul className="mb-3 space-y-1 text-xs text-neutral-700">
          {childRules.losses.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded border border-red-100 bg-red-50 px-2 py-1"
            >
              <span>
                {r.label}
                {r.schedule && r.schedule !== "always" && (
                  <span className="mt-0.5 block text-[10px] font-normal text-neutral-500">{scheduleLabel(r.schedule)}</span>
                )}
              </span>
              <span className="font-semibold">{r.value}</span>
            </li>
          ))}
        </ul>

        <p className="mb-1 text-xs font-semibold text-amber-700">Récompenses (réservées aux parents)</p>
        <ul className="space-y-1 text-xs text-neutral-700">
          {childRules.rewards.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-2 rounded border border-amber-100 bg-amber-50 px-2 py-1"
            >
              <span>{r.label}</span>
              <span className="font-semibold">-{r.rewardCost ?? 0}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className={`rounded-lg bg-gradient-to-r px-3 py-2 text-center text-xs text-white ${accentClass}`}>
        Les points sont mis à jour par tes parents — cette app est en lecture seule.
      </p>
    </main>
  );
}
