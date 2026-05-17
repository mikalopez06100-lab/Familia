"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import SpendingRecap from "@/components/spending-recap";

export default function RewardsPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <section className="flex flex-wrap gap-2">
        <a href="/" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          ← Accueil
        </a>
        <a href="/lisandro" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Fiche Lisandro
        </a>
        <a href="/mila" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Fiche Mila
        </a>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h1 className="text-xl font-semibold">Dépenses (points / étoiles)</h1>
        <p className="text-sm text-neutral-600">Historique complet avec dates, synchronisé via Neon.</p>
      </section>

      <SpendingRecap />

      <a href="/" className="text-sm text-neutral-600 underline">
        Retour à l&apos;accueil
      </a>
    </main>
  );
}
