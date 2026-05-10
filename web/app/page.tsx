import { children } from "@/lib/mock-data";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4">
      <section className="flex flex-wrap gap-2">
        <a href="/history" className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-900">
          Historique semaine
        </a>
        <a href="/rewards" className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Récompenses rachetées
        </a>
      </section>

      <section className="soft-card p-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard famille</h1>
        <p className="text-sm text-slate-600">
          Base Next.js connectée à Neon pour stockage partagé.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {children.map((child) => (
          <article key={child.id} className="soft-card p-4">
            <h2 className="font-semibold text-slate-900">{child.name}</h2>
            <p className="text-sm text-slate-600">Monnaie: {child.currency}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`/${child.id}`}
                className={`inline-block rounded-lg px-3 py-2 text-sm text-white ${
                  child.id === "lisandro" ? "bg-violet-700 hover:bg-violet-800" : "bg-teal-700 hover:bg-teal-800"
                }`}
              >
                Faire le check-in
              </a>
              <a
                href={`/${child.id}#routine`}
                className="inline-block rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                Routine
              </a>
              <a
                href={`/${child.id}#planning`}
                className="inline-block rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
              >
                Planning
              </a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
