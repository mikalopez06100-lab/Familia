"use client";

import { useMemo, useState } from "react";
import {
  DAY_KIND_COLORS,
  DAY_KIND_LABELS,
  getDayContext,
  getDayKind,
  getMonthGrid,
} from "@/lib/school-calendar";
import { formatLocalYmd } from "@/lib/calendar-date";
import { ChildId } from "@/lib/types";

const WEEK_HEADERS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function FamilyCalendar({ childId }: { childId: ChildId }) {
  const today = formatLocalYmd();
  const [viewDate, setViewDate] = useState(() => new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const weeks = useMemo(() => getMonthGrid(year, month), [year, month]);

  const shiftMonth = (delta: number) => {
    setViewDate(new Date(year, month + delta, 1, 12));
  };

  return (
    <section id="agenda" className="soft-card scroll-mt-4 p-3 md:col-span-2">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Agenda — {childId === "lisandro" ? "Lisandro" : "Mila"}</h2>
          <p className="text-xs text-neutral-600">École · sans école · vacances (Zone B)</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-sm"
            aria-label="Mois précédent"
          >
            ←
          </button>
          <span className="min-w-[9rem] text-center text-sm font-medium capitalize">{monthLabel}</span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1 text-sm"
            aria-label="Mois suivant"
          >
            →
          </button>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-2 text-xs">
        {(Object.keys(DAY_KIND_LABELS) as Array<keyof typeof DAY_KIND_LABELS>).map((kind) => (
          <span
            key={kind}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${DAY_KIND_COLORS[kind].bg} ${DAY_KIND_COLORS[kind].border} ${DAY_KIND_COLORS[kind].text}`}
          >
            {DAY_KIND_LABELS[kind]}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-center text-xs">
          <thead>
            <tr>
              {WEEK_HEADERS.map((h) => (
                <th key={h} className="pb-1 font-medium text-neutral-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={`w-${wi}`}>
                {week.map((ymd, di) => {
                  if (!ymd) {
                    return <td key={`e-${wi}-${di}`} className="p-0.5" />;
                  }
                  const kind = getDayKind(ymd, childId);
                  const colors = DAY_KIND_COLORS[kind];
                  const ctx = getDayContext(new Date(`${ymd}T12:00:00`), childId);
                  const isToday = ymd === today;
                  const dayNum = ymd.slice(8, 10).replace(/^0/, "");

                  return (
                    <td key={ymd} className="p-0.5">
                      <div
                        title={ctx.events.join(" · ") || DAY_KIND_LABELS[kind]}
                        className={`relative rounded-lg border px-0.5 py-1 ${colors.bg} ${colors.border} ${isToday ? "ring-2 ring-violet-500 ring-offset-1" : ""}`}
                      >
                        <span className={`font-semibold ${colors.text}`}>{dayNum}</span>
                        {ctx.milaOrthoSession && childId === "mila" && (
                          <span className="mt-0.5 block text-[9px] leading-tight text-teal-800">Ortho</span>
                        )}
                        {childId === "lisandro" && ctx.weekday === 3 && kind === "school" && (
                          <span className="mt-0.5 block text-[9px] leading-tight text-blue-800">Mat.</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
