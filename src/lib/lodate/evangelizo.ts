/**
 * Letture del giorno da Evangelizo.org (API pubblica usata dal loro sito e dalle app:
 * https://publication.evangelizo.ws/IT/days/YYYY-MM-DD). Testi italiani: © Conferenza
 * Episcopale Italiana. Copre i giorni passati e circa due mesi in avanti; oltre, o se il
 * servizio non risponde, restituisce null e la pagina rimanda alle fonti ufficiali.
 *
 * Il testo arriva semplice, con i numeri dei versetti tra doppie quadre ("[[Ps 24,1]]"):
 * \r\n va a capo dentro un versetto, \n tra versetti, \n\n tra strofe.
 */

import { getGospelAcclamation } from "@/lib/lodate/cei";

const API = "https://publication.evangelizo.ws/IT/days";
const REVALIDATE_SECONDS = 6 * 60 * 60;

export type Reading = {
  key: string;
  label: string;
  /** Titolo con il riferimento, es. "Salmi 24(23),1-2.3-4ab.5-6." */
  title: string;
  /** Ritornello del salmo, es. "R. Ecco, viene il Signore, re della gloria." */
  chorus: string | null;
  text: string;
};

export type DailyReadings = {
  /** Titolo liturgico secondo Evangelizo, es. "Tutti i Santi, solennità". */
  title: string;
  readings: Reading[];
};

type ApiReading = {
  id?: string;
  type?: string;
  title?: string | null;
  chorus?: string | null;
  text?: string | null;
  reference_displayed?: string | null;
  book?: { full_title?: string | null } | null;
};

const ORDINALS = ["Prima", "Seconda", "Terza", "Quarta", "Quinta", "Sesta", "Settima"];

/** Testo dell'API → testo semplice con a capo e strofe, senza numeri dei versetti né HTML. */
export function cleanText(raw: string): string {
  return raw
    .replace(/\[\[[^\]]*\]\]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function oneLine(s: string | null | undefined): string {
  return cleanText(s ?? "").replace(/\s+/g, " ");
}

/** Letture del giorno (YYYY-MM-DD), oppure null se il servizio non le fornisce. */
export async function getDailyReadings(iso: string): Promise<DailyReadings | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;

  // l'acclamazione al Vangelo arriva dalla CEI: la si chiede insieme alle letture
  const acclamation = getGospelAcclamation(iso);
  let data: { liturgic_title?: string; readings?: ApiReading[] } | undefined;
  try {
    const res = await fetch(`${API}/${iso}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    data = (await res.json())?.data;
  } catch {
    return null;
  }
  if (!data || !Array.isArray(data.readings)) return null;

  let readingNo = 0;
  const readings: Reading[] = [];
  data.readings.forEach((r, i) => {
    const text = cleanText(r.text ?? "");
    if (!text) return;
    let label: string;
    if (r.type === "psalm") label = "Salmo responsoriale";
    else if (r.type === "gospel") label = "Vangelo";
    else label = `${ORDINALS[readingNo++] ?? "Altra"} lettura`;
    readings.push({
      key: r.id || String(i),
      label,
      title: oneLine(`${r.book?.full_title ?? r.title ?? ""} ${r.reference_displayed ?? ""}`),
      chorus: r.chorus ? oneLine(r.chorus) : null,
      text,
    });
  });
  if (readings.length === 0) return null;

  const acc = await acclamation;
  const gospel = readings.findIndex((r) => r.label === "Vangelo");
  if (acc && gospel >= 0) {
    readings.splice(gospel, 0, {
      key: "acclamazione",
      label: "Acclamazione al Vangelo",
      title: acc.reference,
      chorus: null,
      text: acc.text,
    });
  }

  return { title: oneLine(data.liturgic_title), readings };
}
