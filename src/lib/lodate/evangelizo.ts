/**
 * Letture del giorno dal "Reader Evangelizo" (https://feed.evangelizo.org/), il servizio
 * che Evangelizo.org mette a disposizione per mostrare le letture su altri siti.
 * Testi italiani: © Conferenza Episcopale Italiana. Il servizio copre solo le date
 * entro 30 giorni da oggi; fuori da questo intervallo restituisce null.
 *
 * Le risposte sono frammenti HTML: qui diventano testo semplice (niente HTML nella pagina).
 */

const READER = "https://feed.evangelizo.org/v2/reader.php";
const REVALIDATE_SECONDS = 6 * 60 * 60;

export type ReadingKey = "FR" | "PS" | "SR" | "GSP";

export type Reading = {
  key: ReadingKey;
  label: string;
  /** Titolo lungo con il riferimento, es. "Dal Vangelo di Gesù Cristo secondo Luca 6,12-16." */
  title: string;
  text: string;
};

export type DailyReadings = {
  /** Titolo liturgico secondo Evangelizo, es. "Santi Simone e Giuda, apostoli, festa". */
  title: string;
  readings: Reading[];
};

const READINGS: { key: ReadingKey; label: string }[] = [
  { key: "FR", label: "Prima lettura" },
  { key: "PS", label: "Salmo responsoriale" },
  { key: "SR", label: "Seconda lettura" },
  { key: "GSP", label: "Vangelo" },
];

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  laquo: "«",
  raquo: "»",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
  ndash: "–",
  mdash: "—",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : "";
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Frammento HTML del reader → testo semplice, senza la riga di copyright e l'invito all'iscrizione. */
export function toPlainText(html: string): string {
  const cut = html.search(/Copyright\s*@/i);
  const body = cut >= 0 ? html.slice(0, cut) : html;
  return decodeEntities(body.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, ""))
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function read(params: Record<string, string>): Promise<string | null> {
  const url = `${READER}?${new URLSearchParams({ lang: "IT", ...params })}`;
  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const body = await res.text();
    // Fuori intervallo o parametri errati il reader risponde con la sua pagina di manuale.
    if (/<!DOCTYPE|<html/i.test(body)) return null;
    return body;
  } catch {
    return null;
  }
}

/** Letture del giorno (YYYY-MM-DD), oppure null se il servizio non le fornisce. */
export async function getDailyReadings(iso: string): Promise<DailyReadings | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = iso.replaceAll("-", "");

  const [title, ...parts] = await Promise.all([
    read({ date, type: "liturgic_t" }),
    ...READINGS.flatMap(({ key }) => [
      read({ date, type: "reading_lt", content: key }),
      read({ date, type: "reading", content: key }),
    ]),
  ]);
  if (title === null) return null;

  const readings: Reading[] = [];
  READINGS.forEach(({ key, label }, i) => {
    const longTitle = parts[i * 2];
    const text = parts[i * 2 + 1];
    if (!longTitle || !text) return;
    const plain = toPlainText(text);
    if (!plain) return;
    readings.push({ key, label, title: toPlainText(longTitle), text: plain });
  });
  if (readings.length === 0) return null;

  return { title: toPlainText(title), readings };
}
