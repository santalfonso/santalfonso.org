import type { Metadata } from "next";
import { gte } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { formatDayNumber, formatMonthName, formatTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Calendario" };
export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const list = await db.query.events.findMany({
    where: gte(events.startsAt, new Date().toISOString()),
    orderBy: [events.startsAt],
  });

  return (
    <>
      <section style={{ paddingTop: 64, paddingBottom: 32 }}>
        <div className="container">
          <span className="kicker">Calendario</span>
          <h1 style={{ marginTop: 20, maxWidth: "20ch" }}>
            Prossimi appuntamenti.
          </h1>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          {list.length === 0 ? (
            <p className="muted">Nessun evento in programma al momento.</p>
          ) : (
            <div className="events-grid">
              {list.map((event) => (
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
    </>
  );
}
