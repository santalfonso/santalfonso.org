import Link from "next/link";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { articles, events, resources } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [[articleCount], [eventCount], [resourceCount]] = await Promise.all([
    db.select({ value: count() }).from(articles),
    db.select({ value: count() }).from(events),
    db.select({ value: count() }).from(resources),
  ]);

  const cards = [
    {
      href: "/admin/articoli",
      label: "Articoli",
      total: articleCount.value,
      action: "Gestisci gli articoli e le news del sito",
    },
    {
      href: "/admin/eventi",
      label: "Eventi",
      total: eventCount.value,
      action: "Gestisci gli eventi a calendario",
    },
    {
      href: "/admin/risorse",
      label: "Risorse",
      total: resourceCount.value,
      action: "Carica libretti, documenti e file scaricabili",
    },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-4xl font-bold text-amber-800">{card.total}</p>
            <h2 className="mt-2 text-lg font-semibold text-stone-800">
              {card.label}
            </h2>
            <p className="mt-1 text-sm text-stone-500">{card.action}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
