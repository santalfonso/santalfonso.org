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

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 28,
          lineHeight: 1,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 6 }}>
        {label}
      </div>
    </div>
  );
}

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
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="kicker">Comunità · Prima Porta, Roma</span>
              <h1 style={{ marginTop: 20 }}>
                Una casa di preghiera al cuore della{" "}
                <span style={{ color: "var(--azure-deep)" }}>comunità</span>.
              </h1>
              <p className="lead" style={{ marginTop: 20, maxWidth: "44ch" }}>
                Sulle orme di Sant&apos;Alfonso Maria de&apos; Liguori —
                «Chi prega si salva, chi non prega si danna!» — accogliamo
                chi cerca silenzio, ascolto e parola viva.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
                <Link href="/#orari" className="btn btn--primary">
                  Orari delle Messe
                </Link>
                <Link href="/news" className="btn btn--ghost">
                  Ultime news
                </Link>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 32,
                  marginTop: 48,
                  paddingTop: 32,
                  borderTop: "1px solid var(--rule)",
                  flexWrap: "wrap",
                }}
              >
                <Stat label="Messe settimanali" value="16" />
                <Stat label="Anno di fondazione" value="1975" />
                <Stat label="Visite pontificie" value="2" />
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div className="ph ph--square">
                <span className="ph__label">foto: facciata della chiesa</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prossimi eventi */}
      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <div>
              <span className="kicker">Calendario</span>
              <h2 style={{ marginTop: 14 }}>Prossimi appuntamenti</h2>
            </div>
            <Link href="/news" className="btn--link">
              Tutte le news →
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <p className="muted">Nessun evento in programma al momento.</p>
          ) : (
            <div className="events-grid">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    minHeight: 220,
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 10px",
                      borderRadius: "var(--r-pill)",
                      background: "var(--azure-soft)",
                      color: "var(--azure-deep)",
                      fontSize: 12,
                      fontWeight: 600,
                      alignSelf: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>
                      {formatDayNumber(event.startsAt)}
                    </span>
                    <span style={{ fontSize: 12, textTransform: "capitalize" }}>
                      {formatMonthName(event.startsAt)}
                    </span>
                  </div>
                  <h4 style={{ marginTop: 4 }}>{event.title}</h4>
                  {event.description && (
                    <p style={{ fontSize: 13, marginBottom: 0 }}>
                      {event.description}
                    </p>
                  )}
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--ink-mute)",
                      marginTop: "auto",
                    }}
                  >
                    {formatTime(event.startsAt)}
                    {event.location ? ` · ${event.location}` : ""}
                  </div>
                </div>
              ))}
            </div>
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
            <div className="avvisi-header">
              <div className="avvisi-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#FFC107" aria-hidden="true">
                  <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                </svg>
              </div>
              <h2 className="avvisi-title">Avvisi importanti</h2>
            </div>
            <div className="avvisi-list">
              {activeAnnouncements.map((a) => (
                <div key={a.id} className="avvisi-item">
                  <span className="avvisi-item__dot" aria-hidden="true" />
                  <p className="avvisi-item__text">{a.text}</p>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { v: "17–18:30", l: "Ufficio (feriali)" },
                { v: "06 3320803", l: "Telefono" },
                { v: "Giustiniana 227", l: "Indirizzo" },
                { v: "S. Elisabetta", l: "Cappella Quarto Casale" },
              ].map((item) => (
                <div
                  key={item.l}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    padding: 18,
                    borderRadius: "var(--r-sm)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--gold)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.v}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "color-mix(in oklab, var(--bg) 60%, transparent)",
                      marginTop: 4,
                    }}
                  >
                    {item.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
