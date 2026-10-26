import type { Metadata } from "next";
import Link from "next/link";
import ReadingsDayInfo from "@/components/lodate/ReadingsDayInfo";
import { addDays, isValidLiturgicalDate, liturgicalDay, readingsLinks } from "@/lib/lodate/liturgia";
import { emptySetlist, encodeSetlist, formatLongDate, todayInRome } from "@/lib/lodate/setlist";
import "@/app/lodate-scalette.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Letture del giorno",
  description: "Il giorno liturgico (tempo, colore, anno) e il collegamento alle letture sulla fonte ufficiale CEI.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function LetturePage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).data;
  const requested = Array.isArray(raw) ? raw[0] : raw;
  const today = todayInRome();
  const invalid = Boolean(requested) && !isValidLiturgicalDate(requested!);
  const date = requested && !invalid ? requested : today;
  const day = liturgicalDay(date);
  const { primary, secondary } = readingsLinks(date, today);
  const prev = addDays(date, -1);
  const next = addDays(date, 1);
  const newSetlist = `/lodate/scaletta?d=${encodeSetlist({ ...emptySetlist(), date, feast: day.title })}`;

  return (
    <div className="ls ls-stack">
      <header>
        <span className="ls-kicker">Letture del giorno</span>
        <h2 className="ls-title">{day.title}</h2>
        <p className="ls-muted">
          {formatLongDate(date)}
          {date === today && " · oggi"}
        </p>
        {day.title !== day.dayOfSeason && <p className="ls-small ls-muted">{day.dayOfSeason}</p>}
      </header>

      {invalid && (
        <p className="ls-error" role="alert">
          Data non valida: viene mostrato il giorno di oggi.
        </p>
      )}

      <nav className="ls-daynav" aria-label="Cambia giorno">
        <Link className="ls-btn ls-btn--icon" href={`/lodate/letture?data=${prev}`} aria-label={`Giorno precedente, ${formatLongDate(prev)}`}>
          ←
        </Link>
        <form method="get" className="ls-row" style={{ flexWrap: "nowrap", minWidth: 0 }}>
          <label htmlFor="ls-data" className="ls-sr">
            Scegli la data
          </label>
          <input id="ls-data" type="date" name="data" defaultValue={date} className="ls-input" required />
          <button type="submit" className="ls-btn">
            Vai
          </button>
        </form>
        <Link className="ls-btn ls-btn--icon" href={`/lodate/letture?data=${next}`} aria-label={`Giorno successivo, ${formatLongDate(next)}`}>
          →
        </Link>
      </nav>
      {date !== today && (
        <p>
          <Link className="ls-link" href="/lodate/letture">
            Torna a oggi
          </Link>
        </p>
      )}

      <section className={`ls-card ls-readings-card ls-lit-b--${day.color} ls-stack`} aria-label="Giorno liturgico">
        <ReadingsDayInfo day={day} />
        <div className="ls-row">
          <a className="ls-btn ls-btn--primary" href={primary.href} target="_blank" rel="noopener noreferrer">
            Leggi le letture su {primary.label}
            <span className="ls-sr"> (si apre in una nuova scheda)</span>
          </a>
          <a className="ls-btn" href={secondary.href} target="_blank" rel="noopener noreferrer">
            Fonte alternativa: {secondary.label}
            <span className="ls-sr"> (si apre in una nuova scheda)</span>
          </a>
        </div>
        <Link className="ls-link" href={newSetlist}>
          Prepara la scaletta per questo giorno
        </Link>
      </section>

      <p className="ls-small ls-muted">
        Il giorno liturgico è calcolato secondo il calendario romano per l&apos;Italia (con il proprio
        di Roma e della parrocchia); possono non comparire memorie e feste minori. I testi delle
        letture sono della traduzione ufficiale CEI e sono protetti da diritto d&apos;autore: per
        questo non vengono riprodotti qui ma si leggono sulla fonte ufficiale.
      </p>
    </div>
  );
}
