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
      desc: "Gestisci le news e gli articoli del sito",
    },
    {
      href: "/admin/eventi",
      label: "Eventi",
      total: eventCount.value,
      desc: "Gestisci gli eventi a calendario",
    },
    {
      href: "/admin/risorse",
      label: "Risorse",
      total: resourceCount.value,
      desc: "Carica libretti, documenti e file scaricabili",
    },
  ];

  return (
    <>
      <div className="admin-page-head">
        <h1>Dashboard</h1>
      </div>
      <div className="admin-stats-grid">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="admin-stat-card">
            <div className="admin-stat-num">{card.total}</div>
            <div className="admin-stat-label">{card.label}</div>
            <div className="admin-stat-desc">{card.desc}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
