import { COLOR_LABELS, roman, type LiturgicalDay } from "@/lib/lodate/liturgia";

/** Dettagli del giorno liturgico come etichette: colore, tempo, anno, salterio, grado. */
export default function ReadingsDayInfo({ day }: { day: LiturgicalDay }) {
  const showCycle = day.isSunday || day.rank === "solennità";
  const cycle = showCycle ? day.sundayCycle : day.season === "ordinario" ? day.weekdayCycle : null;
  return (
    <ul className="ls-chips" aria-label="Giorno liturgico">
      <li className="ls-chip">
        <span className={`ls-lit-dot ls-lit--${day.color}`} aria-hidden="true" />
        <span className="ls-chip__k">Colore</span> {COLOR_LABELS[day.color].toLowerCase()}
      </li>
      <li className="ls-chip">{day.seasonLabel}</li>
      {cycle && (
        <li className="ls-chip">
          <span className="ls-chip__k">Anno</span> {cycle}
        </li>
      )}
      {day.psalterWeek && (
        <li className="ls-chip">
          <span className="ls-chip__k">Salterio</span> {roman(day.psalterWeek)} settimana
        </li>
      )}
      {day.rank !== "feria" && day.rank !== "domenica" && (
        <li className="ls-chip ls-chip--rank">{day.rank}</li>
      )}
    </ul>
  );
}
