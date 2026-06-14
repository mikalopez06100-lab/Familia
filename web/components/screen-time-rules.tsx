"use client";

import { childScreenTimeRules, getTodayScreenAllowance, formatMinutes } from "@/lib/screen-time-rules";
import { ChildId } from "@/lib/types";

export default function ScreenTimeRules({ childId }: { childId: ChildId }) {
  const blocks = childScreenTimeRules[childId];
  const today = getTodayScreenAllowance(childId);

  return (
    <section id="ecrans" className="soft-card scroll-mt-4 p-3 md:col-span-2">
      <h2 className="mb-1 text-sm font-semibold">Forfait temps d&apos;écran</h2>
      <div className="mb-3 rounded-lg border border-violet-200 bg-violet-50/80 p-2.5">
        <p className="text-xs font-semibold text-violet-900">Forfait du jour — {today.label}</p>
        <p className="mt-0.5 text-sm font-bold text-slate-900">{formatMinutes(today.minutes)}</p>
        <p className="mt-1 text-xs text-neutral-700">{today.detail}</p>
      </div>
      <p className="mb-3 text-xs text-neutral-600">
        Tous appareils : téléphone, tablette, TV, Switch, console… Les rachats « +30 min » s&apos;ajoutent au forfait du jour.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {blocks.map((block) => (
          <div key={block.title} className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-2.5">
            <p className="text-sm font-semibold text-slate-900">{block.title}</p>
            {block.subtitle && <p className="text-xs text-neutral-500">{block.subtitle}</p>}
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs text-neutral-700">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
