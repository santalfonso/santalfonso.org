import Link from "next/link";
import { liturgicalDay, readingsLinks } from "@/lib/lodate/liturgia";
import { formatLongDate, todayInRome } from "@/lib/lodate/setlist";
import ReadingsDayInfo from "./ReadingsDayInfo";
import "@/app/lodate-scalette.css";

/**
 * Card "Letture del giorno" per la home di /lodate (server component, senza props).
 * Calcola il giorno liturgico in locale e rimanda alla fonte ufficiale per i testi.
 */
export default function ReadingsCard() {
  const today = todayInRome();
  const day = liturgicalDay(today);
  const { primary } = readingsLinks(today, today);

  return (
    <section className="ls" style={{ padding: 0, maxWidth: "none", margin: 0 }} aria-labelledby="ls-readings-card">
      <div className={`ls-card ls-readings-card ls-lit-b--${day.color} ls-stack`}>
        <div>
          <span className="ls-kicker">Oggi · {formatLongDate(today)}</span>
          <h2 id="ls-readings-card" style={{ marginTop: 6 }}>
            {day.title}
          </h2>
          {day.title !== day.dayOfSeason && <p className="ls-muted ls-small">{day.dayOfSeason}</p>}
        </div>
        <ReadingsDayInfo day={day} />
        <div className="ls-row">
          <a className="ls-btn ls-btn--primary" href={primary.href} target="_blank" rel="noopener noreferrer">
            Leggi le letture<span className="ls-sr"> su {primary.label} (si apre in una nuova scheda)</span>
          </a>
          <Link className="ls-btn" href="/lodate/letture">
            Altri giorni
          </Link>
        </div>
      </div>
    </section>
  );
}
