import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { db } from "@/db";
import { articles, events, resources, announcements } from "@/db/schema";
import { deleteAnnouncement } from "@/actions/announcements";
import AnnouncementAddForm from "@/components/admin/AnnouncementAddForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [[articleCount], [eventCount], [resourceCount], avvisi] =
    await Promise.all([
      db.select({ value: count() }).from(articles),
      db.select({ value: count() }).from(events),
      db.select({ value: count() }).from(resources),
      db.query.announcements.findMany({ orderBy: [desc(announcements.createdAt)] }),
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

      {/* Avvisi importanti */}
      <div style={{ borderTop: "1px solid var(--rule)", paddingTop: 36, marginTop: 12 }}>
        <div className="admin-page-head" style={{ marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)", margin: 0 }}>
              Avvisi importanti
            </h2>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: "4px 0 0" }}>
              Vengono mostrati in homepage tra le news e gli orari. Rimuovili quando non sono più validi.
            </p>
          </div>
          {avvisi.length > 0 && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: "var(--r-pill)",
                background: "var(--azure-soft)",
                color: "var(--azure-deep)",
                flexShrink: 0,
              }}
            >
              {avvisi.length} attiv{avvisi.length === 1 ? "o" : "i"}
            </span>
          )}
        </div>

        <AnnouncementAddForm />

        {avvisi.length > 0 && (
          <div className="admin-table-wrap" style={{ marginTop: 20 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Testo avviso</th>
                  <th>Aggiunto il</th>
                  <th className="right">Rimuovi</th>
                </tr>
              </thead>
              <tbody>
                {avvisi.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500 }}>{a.text}</td>
                    <td className="mute">{formatDate(a.createdAt)}</td>
                    <td className="right">
                      <DeleteButton
                        action={deleteAnnouncement.bind(null, a.id)}
                        label="Rimuovi"
                        confirmMessage={`Rimuovere l'avviso "${a.text}"?`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {avvisi.length === 0 && (
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--ink-mute)" }}>
            Nessun avviso attivo. Aggiungine uno con il modulo sopra.
          </p>
        )}
      </div>
    </>
  );
}
