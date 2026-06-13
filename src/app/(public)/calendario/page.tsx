import type { Metadata } from "next";
import { gte } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import EventCardsWithModal from "@/components/EventCardsWithModal";

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
            <EventCardsWithModal events={list} />
          )}
        </div>
      </section>
    </>
  );
}
