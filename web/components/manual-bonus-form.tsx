"use client";

import { useState } from "react";
import { ChildId } from "@/lib/types";
import { getChild, useFamilyStore } from "@/stores/useFamilyStore";

export function ManualBonusForm({ childId }: { childId: ChildId }) {
  const child = getChild(childId);
  const addManualBonus = useFamilyStore((s) => s.addManualBonus);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState(1);

  if (!child) return null;

  const submit = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    const n = Math.min(50, Math.max(1, Math.floor(Number(amount)) || 1));
    addManualBonus(childId, trimmed, n);
    setReason("");
    setAmount(1);
  };

  return (
    <div className="soft-card p-3">
      <h2 className="mb-1 text-sm font-semibold">Bonus (scolaire, comportement…)</h2>
      <p className="mb-3 text-xs text-neutral-600">
        Ajoute des {child.currency} en précisant ce qui a été bien fait (ex. contrôle de maths, aide à la maison).
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-neutral-700">
          Détail
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex. Très bon bulletin, gentillesse avec…"
            className="rounded-lg border border-neutral-300 px-2 py-2 text-sm"
            maxLength={120}
          />
        </label>
        <label className="flex w-full flex-col gap-1 text-xs font-medium text-neutral-700 sm:w-24">
          Montant
          <input
            type="number"
            min={1}
            max={50}
            value={amount}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setAmount(Number.isNaN(n) ? 1 : n);
            }}
            className="rounded-lg border border-neutral-300 px-2 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={submit}
          disabled={!reason.trim()}
          className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
