"use client";

import Link from "next/link";
import { children } from "@/lib/mock-data";
import { useFamilyStore } from "@/stores/useFamilyStore";

export default function RewardsPage() {
  const transactions = useFamilyStore((s) => s.transactions);
  const rewardTx = transactions.filter((t) => t.label.startsWith("Rachat:"));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <section className="flex flex-wrap gap-2">
        <Link href="/" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          ← Accueil
        </Link>
        <Link href="/lisandro" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Fiche Lisandro
        </Link>
        <Link href="/mila" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Fiche Mila
        </Link>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h1 className="text-xl font-semibold">Récompenses rachetées</h1>
        <p className="text-sm text-neutral-600">
          Historique synchronisé via Neon.
        </p>
      </section>

      {children.map((child) => {
        const rows = rewardTx.filter((t) => t.childId === child.id);
        return (
          <section key={child.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-2 font-semibold">{child.name}</h2>
            {rows.length === 0 ? (
              <p className="text-sm text-neutral-500">Aucun rachat.</p>
            ) : (
              <div className="space-y-2">
                {rows.map((r) => (
                  <div key={r.id} className="rounded-lg border border-neutral-200 p-2 text-sm">
                    <p className="font-medium">{r.label}</p>
                    <p className="text-xs text-neutral-500">
                      {new Date(r.createdAt).toLocaleString("fr-FR")} · {r.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <Link href="/" className="text-sm text-neutral-600 underline">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
