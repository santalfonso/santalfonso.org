import Link from "next/link";
import { desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { articles, events, announcements } from "@/db/schema";
import {
  formatDate,
  formatDayNumber,
  formatMonthName,
  formatTime,
} from "@/lib/utils";
import EventCardsWithModal from "@/components/EventCardsWithModal";
import HeroSlideshow from "@/components/HeroSlideshow";

export const dynamic = "force-dynamic";


export default async function HomePage() {
  const [latestArticles, upcomingEvents, activeAnnouncements] = await Promise.all([
    db.query.articles.findMany({
      where: eq(articles.published, true),
      orderBy: [desc(articles.publishedAt)],
      limit: 3,
    }),
    db.query.events.findMany({
      where: gte(events.startsAt, new Date().toISOString()),
      orderBy: [events.startsAt],
      limit: 4,
    }),
    db.query.announcements.findMany({
      orderBy: [desc(announcements.createdAt)],
    }),
  ]);

  return (
    <>
      <HeroSlideshow />

      {/* Prossimi eventi */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="kicker">Calendario</span>
              <h2 style={{ marginTop: 14 }}>Prossimi appuntamenti</h2>
            </div>
            <Link href="/calendario" className="btn--link">
              Calendario →
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="muted">Nessun evento in programma al momento.</p>
          ) : (
            <EventCardsWithModal events={upcomingEvents} />
          )}
        </div>
      </section>

      {/* Ultime news */}
      <section style={{ background: "var(--bg-soft)" }}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="kicker">Bacheca</span>
              <h2 style={{ marginTop: 14 }}>Ultime dalla comunità</h2>
            </div>
            <Link href="/news" className="btn--link">
              Tutte le news →
            </Link>
          </div>

          {latestArticles.length === 0 ? (
            <p className="muted">Nessuna notizia pubblicata al momento.</p>
          ) : (
            <div className="news-grid">
              {latestArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="card"
                  style={{
                    background: "var(--bg)",
                    padding: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {article.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.coverImageUrl}
                      alt=""
                      style={{
                        aspectRatio: "16/10",
                        width: "100%",
                        objectFit: "cover",
                        borderBottom: "1px solid var(--rule)",
                      }}
                    />
                  ) : (
                    <div
                      className="ph ph--landscape"
                      style={{ borderRadius: 0, border: 0, borderBottom: "1px solid var(--rule)" }}
                    >
                      <span className="ph__label">foto</span>
                    </div>
                  )}
                  <div
                    style={{
                      padding: 24,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        fontSize: 12,
                        color: "var(--ink-mute)",
                      }}
                    >
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <h3 style={{ fontSize: 20 }}>{article.title}</h3>
                    {article.excerpt && (
                      <p style={{ fontSize: 14, marginBottom: 0 }}>
                        {article.excerpt}
                      </p>
                    )}
                    <span
                      className="btn--link"
                      style={{ marginTop: "auto", paddingTop: 8 }}
                    >
                      Leggi →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Avvisi importanti */}
      {activeAnnouncements.length > 0 && (
        <section className="avvisi-section">
          <div className="container">
            <div className="avvisi-head">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M16 3v1.5L8.5 8H5a2 2 0 00-2 2v4a2 2 0 002 2h.5l1.5 5h2l-1.5-5H8.5L16 19.5V21l3-1.5V4.5L16 3zM17 18.1l-7-3.5V9.4l7-3.5v12.2z"/>
              </svg>
              <div>
                <span className="avvisi-head__kicker">Comunicazioni</span>
                <h2 className="avvisi-head__title">Avvisi importanti</h2>
              </div>
            </div>
            <div className="avvisi-grid">
              {activeAnnouncements.map((a) => (
                <div key={a.id} className="avvisi-card">
                  <h3 className="avvisi-card__title">{a.title}</h3>
                  <p className="avvisi-card__text">{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Orari */}
      <section id="orari">
        <div className="container">
          <div className="sched-grid">
            <div>
              <span className="kicker">Visita</span>
              <h2 style={{ marginTop: 14 }}>Orari &amp; informazioni</h2>
              <p style={{ marginTop: 16, maxWidth: "40ch" }}>
                Ti aspettiamo per la celebrazione, per una sosta di silenzio o
                per conoscere la comunità. La messa delle 10:30 della domenica
                è dedicata alle famiglie e ai bambini del catechismo.
              </p>
              <Link href="/dove-siamo" className="btn btn--ghost" style={{ marginTop: 16 }}>
                Come arrivare
              </Link>
            </div>
            <div className="card" style={{ padding: 0 }}>
              {[
                { day: "Feriali (lun – sab)", times: ["8:00", "18:30"] },
                {
                  day: "Domenica e festività",
                  times: ["8:30", "10:30", "12:00", "18:30"],
                },
                {
                  day: "Confessioni",
                  times: ["Durante la messa domenicale o su accordo"],
                },
                { day: "Rosario", times: ["Ogni giorno 17:45"] },
                { day: "Adorazione eucaristica", times: ["Martedì 8:30 — 18:30"] },
                { day: "Ufficio parrocchiale", times: ["Feriali 17:00 — 18:30"] },
              ].map((row, i, arr) => (
                <div
                  key={row.day}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "18px 24px",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--rule)" : "0",
                    gap: 24,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                    {row.day}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    {row.times.map((time) => (
                      <span
                        key={time}
                        className="tag"
                        style={{
                          background: "var(--bg-soft)",
                          borderColor: "var(--rule)",
                          color: "var(--ink)",
                          fontWeight: 500,
                        }}
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Banner contatti */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-banner">
            <div>
              <span className="kicker" style={{ color: "var(--gold)" }}>
                Vieni a trovarci
              </span>
              <h2 style={{ color: "var(--bg)", marginTop: 14 }}>
                La porta della parrocchia è sempre{" "}
                <span style={{ color: "var(--gold)" }}>aperta</span>.
              </h2>
              <p
                className="lead"
                style={{
                  color: "color-mix(in oklab, var(--bg) 75%, transparent)",
                  marginTop: 16,
                  maxWidth: "50ch",
                }}
              >
                Per prenotare i sacramenti, chiedere un certificato o
                semplicemente fare due chiacchiere: l&apos;ufficio parrocchiale
                ti aspetta nei giorni feriali dalle 17:00 alle 18:30.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
                <Link
                  href="/contatti"
                  className="btn"
                  style={{
                    background: "var(--gold)",
                    borderColor: "var(--gold)",
                    color: "#0F1419",
                  }}
                >
                  Contattaci
                </Link>
                <Link
                  href="/dove-siamo"
                  className="btn btn--ghost"
                  style={{
                    background: "transparent",
                    color: "var(--bg)",
                    borderColor: "color-mix(in oklab, var(--bg) 25%, transparent)",
                  }}
                >
                  Dove siamo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
