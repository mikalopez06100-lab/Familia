"use client";

import { DAY_KIND_COLORS, DAY_KIND_LABELS, getDayContext } from "@/lib/school-calendar";
import { getTodayScreenAllowance, formatMinutes } from "@/lib/screen-time-rules";
import { ChildId } from "@/lib/types";

export default function DayContextBanner({ childId }: { childId: ChildId }) {
  const now = new Date();
  const ctx = getDayContext(now, childId);
  const screen = getTodayScreenAllowance(childId, now);
  const colors = DAY_KIND_COLORS[ctx.dayKind];
  const dateLabel = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className={`rounded-xl border p-3 ${colors.bg} ${colors.border}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-600">Aujourd&apos;hui</p>
      <p className="mt-0.5 text-sm font-semibold capitalize text-slate-900">{dateLabel}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.border} ${colors.text}`}>
          {DAY_KIND_LABELS[ctx.dayKind]}
        </span>
        {ctx.events
          .filter((e) => e !== DAY_KIND_LABELS[ctx.dayKind] && e !== "Week-end")
          .map((e) => (
            <span key={e} className="rounded-full border border-neutral-200 bg-white/80 px-2.5 py-0.5 text-xs text-slate-700">
              {e}
            </span>
          ))}
      </div>
      <p className="mt-2 text-xs text-neutral-700">
        <strong>Écrans aujourd&apos;hui :</strong> {formatMinutes(screen.minutes)} — {screen.detail}
      </p>
    </div>
  );
}
