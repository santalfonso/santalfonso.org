import { COLOR_LABELS, roman, type LiturgicalDay } from "@/lib/lodate/liturgia";

/** Dettagli del giorno liturgico: tempo, colore, cicli. Nessun testo delle letture. */
export default function ReadingsDayInfo({ day }: { day: LiturgicalDay }) {
  const showCycle = day.isSunday || day.rank === "solennità";
  return (
    <ul className="ls-meta" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      <li>
        <span className={`ls-lit-dot ls-lit--${day.color}`} aria-hidden="true" /> Colore{" "}
        {COLOR_LABELS[day.color].toLowerCase()}
      </li>
      <li>{day.seasonLabel}</li>
      {showCycle ? <li>Anno {day.sundayCycle}</li> : day.season === "ordinario" && <li>Anno {day.weekdayCycle}</li>}
      {day.psalterWeek && <li>Salterio: {roman(day.psalterWeek)} settimana</li>}
      {day.rank !== "feria" && day.rank !== "domenica" && <li style={{ textTransform: "capitalize" }}>{day.rank}</li>}
    </ul>
  );
}
