import Link from "next/link";
import { children } from "@/lib/mock-data";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <h1 className="text-xl font-semibold">Dashboard famille</h1>
        <p className="text-sm text-neutral-600">
          Base Next.js connectée à Neon pour stockage partagé.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {children.map((child) => (
          <article key={child.id} className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="font-semibold">{child.name}</h2>
            <p className="text-sm text-neutral-600">Monnaie: {child.currency}</p>
            <Link
              href={`/${child.id}`}
              className="mt-3 inline-block rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white"
            >
              Faire le check-in
            </Link>
          </article>
        ))}
      </section>

      <section className="flex flex-wrap gap-2">
        <Link href="/history" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Historique semaine
        </Link>
        <Link href="/rewards" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm">
          Récompenses rachetées
        </Link>
      </section>
    </main>
  );
}
