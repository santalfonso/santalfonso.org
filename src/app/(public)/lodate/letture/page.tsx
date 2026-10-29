import type { Metadata } from "next";
import Link from "next/link";
import ReadingsDateField from "@/components/lodate/ReadingsDateField";
import { getDailyReadings } from "@/lib/lodate/evangelizo";
import { addDays, isValidLiturgicalDate, liturgicalDay, readingsLinks } from "@/lib/lodate/liturgia";
import { emptySetlist, encodeSetlist, formatLongDate, todayInRome } from "@/lib/lodate/setlist";
import "@/app/lodate-scalette.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Letture del giorno",
  description: "Le letture della Messa del giorno secondo il Lezionario CEI, con tempo, colore e anno liturgico.",
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
  const readings = await getDailyReadings(date);
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
        <ReadingsDateField key={date} date={date} />
        <Link className="ls-btn ls-btn--icon" href={`/lodate/letture?data=${next}`} aria-label={`Giorno successivo, ${formatLongDate(next)}`}>
          →
        </Link>
      </nav>
      {date !== today && (
        <p className="ls-today">
          <Link className="ls-btn ls-btn--small ls-today__btn" href="/lodate/letture">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3.5" y="5" width="17" height="15" rx="2" />
              <path strokeLinecap="round" d="M3.5 10h17M8 3v4M16 3v4" />
              <circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none" />
            </svg>
            Torna a oggi
          </Link>
        </p>
      )}

      <Link className={`ls-cta-lit ls-cta-lit--${day.color}`} href={newSetlist}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h11M9 12h11M9 18h7M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
        <span className="ls-cta-lit__text">Prepara la scaletta per questo giorno</span>
        <svg className="ls-cta-lit__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>

      {readings ? (
        <>
          {readings.readings.map((r) => (
            <section key={r.key} className="ls-card ls-stack ls-reading" aria-labelledby={`ls-reading-${r.key}`}>
              <span className="ls-kicker">{r.label}</span>
              <h3 id={`ls-reading-${r.key}`}>{r.title}</h3>
              {r.chorus && <p className="ls-reading__chorus">{r.chorus}</p>}
              <p className="ls-reading__text">{r.text}</p>
            </section>
          ))}
        </>
      ) : (
        <section className="ls-card ls-stack" aria-label="Letture sulla fonte ufficiale">
          <p className="ls-muted">
            Il testo delle letture per questa data non è disponibile qui (il servizio copre i giorni passati e
            circa due mesi in avanti). Puoi leggerle sulla fonte ufficiale.
          </p>
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
        </section>
      )}

      <p className="ls-small ls-muted ls-calendar-note">
        Il giorno liturgico è calcolato secondo il calendario romano per l&apos;Italia (con il proprio
        di Roma e della parrocchia); possono non comparire memorie e feste minori.
      </p>
    </div>
  );
}
