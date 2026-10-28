/**
 * Scalette di "Lodate, lodate Iddio": modello dati, validazione,
 * (de)serializzazione compatta nell'URL e ordinamento dei momenti.
 *
 * Nessuna dipendenza da Node o dal browser: usabile lato server, lato client
 * e negli script di test (`npx tsx scripts/lodate/test-setlist.ts`).
 */
import { EXTRA_MOMENT, MOMENTS, MOMENT_SLUGS, isMoment, momentLabel, type Moment } from "./constants";

/** Valore di `after` che colloca un momento speciale prima di tutti. */
export const EXTRA_AT_START = "inizio";
export type ExtraPosition = Moment | typeof EXTRA_AT_START;

export const LIMITS = {
  title: 120,
  feast: 120,
  notes: 1000,
  extraLabel: 60,
  extras: 6,
  songsPerMoment: 10,
  totalSongs: 40,
  /** Lunghezza massima del parametro `d` accettata dal server. */
  encoded: 6000,
} as const;

/** Versione corrente del formato URL (`d=2.<base64url>`); la 1 si legge ancora. */
export const URL_FORMAT_VERSION = 2;

export type SetlistItems = Record<Moment, number[]>;

/** Momento speciale con nome libero, collocato dopo un momento della Messa (o all'inizio). */
export type SetlistExtra = { label: string; after: ExtraPosition; songs: number[] };

const DEFAULT_EXTRA_LABEL = "Momento speciale";

export type SetlistData = {
  title: string;
  /** YYYY-MM-DD oppure null */
  date: string | null;
  feast: string | null;
  notes: string | null;
  items: SetlistItems;
  /** Momenti speciali, nell'ordine in cui sono stati aggiunti. */
  extras: SetlistExtra[];
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

export function emptyItems(): SetlistItems {
  const items = {} as SetlistItems;
  for (const m of MOMENT_SLUGS) items[m] = [];
  return items;
}

/** Chiave di sezione di un momento speciale (righe `setlist_items.moment`, builder). */
export function extraKey(index: number): string {
  return `${EXTRA_MOMENT}:${index}`;
}

/** Indice del momento speciale da una chiave `extra:N` (la vecchia `extra` vale 0), altrimenti null. */
export function extraIndex(key: string): number | null {
  if (key === EXTRA_MOMENT) return 0;
  const m = /^extra:(\d{1,2})$/.exec(key);
  return m ? Number(m[1]) : null;
}

export function emptySetlist(): SetlistData {
  return {
    title: "",
    date: null,
    feast: null,
    notes: null,
    items: emptyItems(),
    extras: [],
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
  const take = (value: unknown) => {
    const ids = cleanIds(value).slice(0, Math.max(0, LIMITS.totalSongs - total));
    total += ids.length;
    return ids;
  };
  for (const m of MOMENT_SLUGS) items[m] = take(rawItems[m]);

  // Formato precedente: un solo momento speciale (extraLabel, extraAfter, items.extra).
  const rawExtras = Array.isArray(src.extras)
    ? src.extras
    : src.extraLabel || (Array.isArray(rawItems.extra) && rawItems.extra.length)
      ? [{ label: src.extraLabel, after: src.extraAfter, songs: rawItems.extra }]
      : [];

  const extras: SetlistExtra[] = [];
  for (const raw of rawExtras.slice(0, LIMITS.extras)) {
    const e = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const after = typeof e.after === "string" ? e.after : null;
    extras.push({
      label: cleanText(e.label, LIMITS.extraLabel) ?? DEFAULT_EXTRA_LABEL,
      after: after === EXTRA_AT_START || (after && isMoment(after)) ? (after as ExtraPosition) : "finale",
      songs: take(e.songs),
    });
  }

  return {
    title: cleanText(src.title, LIMITS.title) ?? "",
    date: isValidIsoDate(src.date) ? src.date : null,
    feast: cleanText(src.feast, LIMITS.feast),
    notes: cleanText(src.notes, LIMITS.notes, true),
    items,
    extras,
  };
}

/** Rimuove gli id che non corrispondono a canti esistenti/pubblicati. */
export function filterKnownSongs(data: SetlistData, known: Set<number>): SetlistData {
  const items = emptyItems();
  for (const m of MOMENT_SLUGS) items[m] = data.items[m].filter((id) => known.has(id));
  const extras = data.extras.map((e) => ({ ...e, songs: e.songs.filter((id) => known.has(id)) }));
  return { ...data, items, extras };
}

function allLists(data: SetlistData): number[][] {
  return [...MOMENT_SLUGS.map((m) => data.items[m]), ...data.extras.map((e) => e.songs)];
}

export function allSongIds(data: SetlistData): number[] {
  return [...new Set(allLists(data).flat())];
}

export function countSongs(data: SetlistData): number {
  return allLists(data).reduce((n, ids) => n + ids.length, 0);
}

// ───────────────────────────── ordinamento ─────────────────────────────

export type SetlistSection = {
  /** Slug del momento della Messa oppure `extra:N` per un momento speciale. */
  key: string;
  /** Indice in `extras` per i momenti speciali, altrimenti null. */
  extraIndex: number | null;
  label: string;
  songIds: number[];
};

/**
 * Sezioni nell'ordine fisso della Messa, con ogni momento speciale inserito
 * dopo il suo `after` (o in testa se `after` = "inizio").
 * `includeEmpty` = true restituisce anche i momenti senza canti (builder).
 */
export function orderedSections(data: SetlistData, includeEmpty = false): SetlistSection[] {
  const extrasAfter = (pos: ExtraPosition): SetlistSection[] =>
    data.extras.flatMap((e, i) =>
      e.after === pos
        ? [{ key: extraKey(i), extraIndex: i, label: e.label || DEFAULT_EXTRA_LABEL, songIds: e.songs }]
        : []
    );
  const sections: SetlistSection[] = [...extrasAfter(EXTRA_AT_START)];
  for (const m of MOMENTS) {
    sections.push({ key: m.slug, extraIndex: null, label: m.label, songIds: data.items[m.slug] });
    sections.push(...extrasAfter(m.slug));
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
 * Formato v2: `2.` + base64url(JSON) dove il JSON è un array posizionale
 * `[titolo, data, festa, note, [ids per momento × 8], [[etichetta, dopo, ids], …]]`
 * con le stringhe vuote al posto dei null (più compatto).
 * Formato v1 (solo lettura): `[titolo, data, festa, note, etichettaExtra, extraAfter, [ids × 8], idsExtra]`.
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
    moments,
    data.extras.map((e) => [e.label, e.after, e.songs]),
  ];
  // toglie i campi finali vuoti per accorciare il link
  const isEmpty = (v: unknown) => v === "" || (Array.isArray(v) && v.length === 0);
  while (payload.length && isEmpty(payload[payload.length - 1])) payload.pop();
  return `${URL_FORMAT_VERSION}.${toBase64Url(JSON.stringify(payload))}`;
}

function momentsToItems(moments: unknown): Record<string, unknown> {
  const items: Record<string, unknown> = {};
  if (Array.isArray(moments)) MOMENT_SLUGS.forEach((m, i) => (items[m] = moments[i]));
  return items;
}

/** Decodifica il parametro `d`; null se assente, troppo lungo o malformato. */
export function decodeSetlist(encoded: unknown): SetlistData | null {
  if (typeof encoded !== "string" || !encoded || encoded.length > LIMITS.encoded) return null;
  const dot = encoded.indexOf(".");
  if (dot < 1) return null;
  const version = encoded.slice(0, dot);
  if (version !== "1" && version !== "2") return null;
  let arr: unknown;
  try {
    arr = JSON.parse(fromBase64Url(encoded.slice(dot + 1)));
  } catch {
    return null;
  }
  if (!Array.isArray(arr)) return null;
  if (version === "1") {
    const [title, date, feast, notes, extraLabel, extraAfter, moments, extra] = arr;
    const items = { ...momentsToItems(moments), extra };
    return normalizeSetlist({ title, date, feast, notes, extraLabel, extraAfter, items });
  }
  const [title, date, feast, notes, moments, rawExtras] = arr;
  const extras = Array.isArray(rawExtras)
    ? rawExtras.map((e) => (Array.isArray(e) ? { label: e[0], after: e[1], songs: e[2] } : null))
    : [];
  return normalizeSetlist({ title, date, feast, notes, items: momentsToItems(moments), extras });
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

type ItemRow = { moment: string; songId: number; position: number };

/**
 * Nomi e posizioni dei momenti speciali, salvati come JSON nella colonna
 * `setlists.extra_label` (`[{"label","after"}, …]`). Le scalette salvate prima
 * hanno lì un'etichetta semplice e la posizione in `extra_after`.
 */
export function extrasMetaToColumns(extras: SetlistExtra[]): { extraLabel: string | null; extraAfter: null } {
  return {
    extraLabel: extras.length ? JSON.stringify(extras.map(({ label, after }) => ({ label, after }))) : null,
    extraAfter: null,
  };
}

function extrasMetaFromColumns(extraLabel: string | null, extraAfter: string | null): { label: unknown; after: unknown }[] {
  if (!extraLabel) return [];
  if (extraLabel.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(extraLabel);
      if (Array.isArray(parsed)) {
        return parsed.map((e) => (e && typeof e === "object" ? (e as { label: unknown; after: unknown }) : { label: null, after: null }));
      }
    } catch {
      // etichetta che inizia per "[" ma non è JSON: la si tratta come testo
    }
  }
  return [{ label: extraLabel, after: extraAfter }];
}

/** Ricostruisce i dati della scaletta da riga `setlists` e righe `setlist_items`. */
export function setlistFromRows(
  row: { title: string; celebrationDate: string | null; feast: string | null; notes: string | null; extraLabel: string | null; extraAfter: string | null },
  rows: ItemRow[]
): SetlistData {
  const items = emptyItems() as Record<string, number[]>;
  const extraSongs = new Map<number, number[]>();
  for (const r of [...rows].sort((a, b) => a.position - b.position)) {
    if (isMoment(r.moment)) items[r.moment].push(r.songId);
    else {
      const i = extraIndex(r.moment);
      if (i !== null) extraSongs.set(i, [...(extraSongs.get(i) ?? []), r.songId]);
    }
  }
  const meta = extrasMetaFromColumns(row.extraLabel, row.extraAfter);
  // canti di momenti speciali senza nome salvato: non si perdono
  const count = Math.max(meta.length, ...[...extraSongs.keys()].map((i) => i + 1));
  const extras = Array.from({ length: count }, (_, i) => ({ ...(meta[i] ?? {}), songs: extraSongs.get(i) ?? [] }));
  return normalizeSetlist({
    title: row.title,
    date: row.celebrationDate,
    feast: row.feast,
    notes: row.notes,
    items,
    extras,
  });
}

/** Righe `setlist_items` da inserire (position progressiva per momento). */
export function rowsFromSetlist(data: SetlistData): ItemRow[] {
  return [
    ...MOMENT_SLUGS.flatMap((m) => data.items[m].map((songId, position) => ({ moment: m as string, songId, position }))),
    ...data.extras.flatMap((e, i) => e.songs.map((songId, position) => ({ moment: extraKey(i), songId, position }))),
  ];
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
