/**
 * Scalette di "Lodate, lodate Iddio": modello dati, validazione,
 * (de)serializzazione compatta nell'URL e ordinamento dei momenti.
 *
 * Nessuna dipendenza da Node o dal browser: usabile lato server, lato client
 * e negli script di test (`npx tsx scripts/lodate/test-setlist.ts`).
 */
import {
  EXTRA_MOMENT,
  MOMENTS,
  MOMENT_SLUGS,
  isMoment,
  momentLabel,
  type Moment,
  type SetlistMoment,
} from "./constants";

/** Valore di `extraAfter` che colloca il momento speciale prima di tutti. */
export const EXTRA_AT_START = "inizio";
export type ExtraPosition = Moment | typeof EXTRA_AT_START;

export const LIMITS = {
  title: 120,
  feast: 120,
  notes: 1000,
  extraLabel: 60,
  songsPerMoment: 10,
  totalSongs: 40,
  /** Lunghezza massima del parametro `d` accettata dal server. */
  encoded: 6000,
} as const;

/** Versione corrente del formato URL (`d=1.<base64url>`). */
export const URL_FORMAT_VERSION = 1;

export type SetlistItems = Record<SetlistMoment, number[]>;

export type SetlistData = {
  title: string;
  /** YYYY-MM-DD oppure null */
  date: string | null;
  feast: string | null;
  notes: string | null;
  /** Etichetta del momento speciale; null = nessun momento speciale */
  extraLabel: string | null;
  extraAfter: ExtraPosition | null;
  items: SetlistItems;
};

/** Dati minimi di un canto per il builder e la vista scaletta. */
export type SetlistSong = {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  musicalKey: string | null;
  moments: string[];
  seasons: string[];
};

export const SETLIST_ORDER: SetlistMoment[] = [...MOMENT_SLUGS, EXTRA_MOMENT];

export function emptyItems(): SetlistItems {
  const items = {} as SetlistItems;
  for (const m of SETLIST_ORDER) items[m] = [];
  return items;
}

export function emptySetlist(): SetlistData {
  return {
    title: "",
    date: null,
    feast: null,
    notes: null,
    extraLabel: null,
    extraAfter: null,
    items: emptyItems(),
  };
}

// ───────────────────────────── validazione ─────────────────────────────

function cleanText(value: unknown, max: number, multiline = false): string | null {
  if (typeof value !== "string") return null;
  let s = value.replace(/\r\n?/g, "\n");
  // via i caratteri di controllo (tranne l'a capo nelle note)
  s = s.replace(multiline ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, multiline ? "" : " ");
  s = s.trim();
  if (!s) return null;
  return Array.from(s).slice(0, max).join("").trim() || null;
}

export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (y < 1900 || y > 2200) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function cleanIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const out: number[] = [];
  for (const v of value) {
    const n = typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v;
    if (typeof n === "number" && Number.isSafeInteger(n) && n > 0 && !out.includes(n)) {
      out.push(n);
    }
    if (out.length >= LIMITS.songsPerMoment) break;
  }
  return out;
}

/**
 * Normalizza un oggetto qualsiasi (input utente, JSON, riga DB) in una
 * `SetlistData` valida: testi tagliati, data valida o null, id interi
 * positivi senza doppioni nello stesso momento, limiti rispettati.
 */
export function normalizeSetlist(input: unknown): SetlistData {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const rawItems = (src.items && typeof src.items === "object" ? src.items : {}) as Record<string, unknown>;

  const items = emptyItems();
  let total = 0;
  for (const m of SETLIST_ORDER) {
    const ids = cleanIds(rawItems[m]);
    const room = LIMITS.totalSongs - total;
    items[m] = ids.slice(0, Math.max(0, room));
    total += items[m].length;
  }

  const extraLabel = cleanText(src.extraLabel, LIMITS.extraLabel);
  const after = typeof src.extraAfter === "string" ? src.extraAfter : null;
  let extraAfter: ExtraPosition | null = null;
  if (extraLabel || items.extra.length) {
    extraAfter = after === EXTRA_AT_START || (after && isMoment(after)) ? (after as ExtraPosition) : "finale";
  }

  return {
    title: cleanText(src.title, LIMITS.title) ?? "",
    date: isValidIsoDate(src.date) ? src.date : null,
    feast: cleanText(src.feast, LIMITS.feast),
    notes: cleanText(src.notes, LIMITS.notes, true),
    extraLabel: extraLabel ?? (items.extra.length ? "Momento speciale" : null),
    extraAfter,
    items,
  };
}

/** Rimuove gli id che non corrispondono a canti esistenti/pubblicati. */
export function filterKnownSongs(data: SetlistData, known: Set<number>): SetlistData {
  const items = emptyItems();
  for (const m of SETLIST_ORDER) items[m] = data.items[m].filter((id) => known.has(id));
  return { ...data, items };
}

export function allSongIds(data: SetlistData): number[] {
  return [...new Set(SETLIST_ORDER.flatMap((m) => data.items[m]))];
}

export function countSongs(data: SetlistData): number {
  return SETLIST_ORDER.reduce((n, m) => n + data.items[m].length, 0);
}

// ───────────────────────────── ordinamento ─────────────────────────────

export type SetlistSection = {
  moment: SetlistMoment;
  label: string;
  songIds: number[];
};

/**
 * Sezioni nell'ordine fisso della Messa, con il momento speciale inserito
 * dopo `extraAfter` (o in testa se `extraAfter` = "inizio").
 * `includeEmpty` = true restituisce anche i momenti senza canti (builder).
 */
export function orderedSections(data: SetlistData, includeEmpty = false): SetlistSection[] {
  const hasExtra = Boolean(data.extraLabel) || data.items.extra.length > 0;
  const extra: SetlistSection = {
    moment: EXTRA_MOMENT,
    label: data.extraLabel || "Momento speciale",
    songIds: data.items.extra,
  };
  const sections: SetlistSection[] = [];
  if (hasExtra && data.extraAfter === EXTRA_AT_START) sections.push(extra);
  for (const m of MOMENTS) {
    sections.push({ moment: m.slug, label: m.label, songIds: data.items[m.slug] });
    if (hasExtra && (data.extraAfter ?? "finale") === m.slug) sections.push(extra);
  }
  return includeEmpty ? sections : sections.filter((s) => s.songIds.length > 0);
}

export function extraPositionLabel(pos: ExtraPosition): string {
  return pos === EXTRA_AT_START ? "All'inizio della celebrazione" : `Dopo: ${momentLabel(pos)}`;
}

// ───────────────────────────── codifica URL ─────────────────────────────

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(b64: string): string {
  if (!/^[A-Za-z0-9_-]*$/.test(b64)) throw new Error("base64url non valido");
  const std = b64.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(std + "=".repeat((4 - (std.length % 4)) % 4));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/**
 * Formato v1: `1.` + base64url(JSON) dove il JSON è un array posizionale
 * `[titolo, data, festa, note, etichettaExtra, extraAfter, [ids per momento × 8], idsExtra]`
 * con le stringhe vuote al posto dei null (più compatto).
 */
export function encodeSetlist(input: SetlistData): string {
  const data = normalizeSetlist(input);
  const moments = MOMENT_SLUGS.map((m) => data.items[m]);
  while (moments.length && moments[moments.length - 1].length === 0) moments.pop();
  const payload: unknown[] = [
    data.title,
    data.date ?? "",
    data.feast ?? "",
    data.notes ?? "",
    data.extraLabel ?? "",
    data.extraAfter ?? "",
    moments,
    data.items.extra,
  ];
  // toglie i campi finali vuoti per accorciare il link
  const isEmpty = (v: unknown) => v === "" || (Array.isArray(v) && v.length === 0);
  while (payload.length && isEmpty(payload[payload.length - 1])) payload.pop();
  return `${URL_FORMAT_VERSION}.${toBase64Url(JSON.stringify(payload))}`;
}

/** Decodifica il parametro `d`; null se assente, troppo lungo o malformato. */
export function decodeSetlist(encoded: unknown): SetlistData | null {
  if (typeof encoded !== "string" || !encoded || encoded.length > LIMITS.encoded) return null;
  const dot = encoded.indexOf(".");
  if (dot < 1) return null;
  const version = encoded.slice(0, dot);
  if (version !== String(URL_FORMAT_VERSION)) return null;
  let arr: unknown;
  try {
    arr = JSON.parse(fromBase64Url(encoded.slice(dot + 1)));
  } catch {
    return null;
  }
  if (!Array.isArray(arr)) return null;
  const [title, date, feast, notes, extraLabel, extraAfter, moments, extra] = arr;
  const items: Record<string, unknown> = { extra };
  if (Array.isArray(moments)) {
    MOMENT_SLUGS.forEach((m, i) => (items[m] = moments[i]));
  }
  return normalizeSetlist({ title, date, feast, notes, extraLabel, extraAfter, items });
}

export const SETLIST_URL_PATH = "/lodate/scaletta/v";

export function setlistUrlPath(data: SetlistData): string {
  return `${SETLIST_URL_PATH}?d=${encodeSetlist(data)}`;
}

/** Link al testo del canto con il ritorno alla scaletta. */
export function songHref(slug: string, from: string): string {
  return `/lodate/canti/${encodeURIComponent(slug)}?from=${encodeURIComponent(from)}`;
}

// ───────────────────────────── righe DB ─────────────────────────────

/** Converte le righe `setlist_items` nel dizionario per momento, ordinato. */
export function itemsFromRows(
  rows: { moment: string; songId: number; position: number }[]
): SetlistItems {
  const items = emptyItems();
  const sorted = [...rows].sort((a, b) => a.position - b.position);
  for (const r of sorted) {
    if (r.moment === EXTRA_MOMENT || isMoment(r.moment)) {
      items[r.moment as SetlistMoment].push(r.songId);
    }
  }
  return items;
}

/** Righe `setlist_items` da inserire (position progressiva per momento). */
export function rowsFromItems(items: SetlistItems): { moment: SetlistMoment; songId: number; position: number }[] {
  return SETLIST_ORDER.flatMap((m) => items[m].map((songId, position) => ({ moment: m, songId, position })));
}

// ───────────────────────────── date ─────────────────────────────

/** Data odierna (YYYY-MM-DD) nel fuso di Roma. */
export function todayInRome(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** "domenica 29 novembre 2026" */
export function formatLongDate(iso: string | null): string {
  if (!iso || !isValidIsoDate(iso)) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
