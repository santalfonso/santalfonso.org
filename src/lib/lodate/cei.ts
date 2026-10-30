/**
 * Acclamazione al Vangelo dalla pagina "Liturgia del giorno" della CEI
 * (chiesacattolica.it): Evangelizo non la fornisce. Si prende solo quella sezione;
 * se la pagina non risponde o cambia struttura restituisce null e la pagina va avanti
 * senza. Nei giorni con più Messe (es. Natale) vale la prima.
 */

const PAGE = "https://www.chiesacattolica.it/liturgia-del-giorno/?data-liturgia=";
const REVALIDATE_SECONDS = 6 * 60 * 60;

export type GospelAcclamation = {
  /** Riferimento del versetto, es. "Gv 10,27" o "Cf. Mc 9,7". */
  reference: string;
  /** Testo completo: "Alleluia, alleluia." (o "Lode e onore…"), versetto e ripresa. */
  text: string;
};

const ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  laquo: "«",
  raquo: "»",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  egrave: "è",
  eacute: "é",
  agrave: "à",
  igrave: "ì",
  ograve: "ò",
  ugrave: "ù",
  Egrave: "È",
};

function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e] ?? m;
  });
}

/** HTML della sezione → righe di testo, con riga vuota tra antifona, versetto e ripresa. */
export function parseAcclamation(html: string): GospelAcclamation | null {
  const start = html.search(/>\s*Acclamazione al Vangelo\s*</);
  if (start < 0) return null;
  const rest = html.slice(start);
  const open = rest.indexOf("cci-liturgia-giorno-section-content");
  if (open < 0) return null;
  const body = rest.slice(rest.indexOf(">", open) + 1);
  const raw = body.slice(0, body.search(/<\/div>/i));

  const text = decode(
    raw
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]*>/g, "")
  )
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!text) return null;

  // riferimento tra parentesi alla fine del versetto: "(Gv 10,27)" o "(Cf. Mc 9,7)"
  let reference = "";
  const cleaned = text.replace(/\s*\(\s*((?:Cf\.\s*)?[1-3]?\s?[A-Z][a-z]{0,3}\s*\d[^()]*?)\s*\)/, (_, ref: string) => {
    reference = ref.replace(/\s+/g, " ").trim();
    return "";
  });
  // la CEI non separa sempre allo stesso modo: antifona, versetto e ripresa a blocchi
  const lines = cleaned.split("\n").filter((l) => l.trim());
  const blocks = lines.length >= 3 ? [lines[0], "", ...lines.slice(1, -1), "", lines[lines.length - 1]] : lines;
  return { reference, text: blocks.join("\n") };
}

/** Acclamazione al Vangelo del giorno (YYYY-MM-DD), oppure null. */
export async function getGospelAcclamation(iso: string): Promise<GospelAcclamation | null> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  try {
    const res = await fetch(PAGE + iso.replace(/-/g, ""), {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return parseAcclamation(await res.text());
  } catch {
    return null;
  }
}
