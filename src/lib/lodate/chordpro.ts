/**
 * ChordPro ridotto per "Lodate, lodate Iddio" (vedi contratto condiviso).
 *
 * - Accordi in linea tra quadre prima della sillaba: `[G]Tu scendi dalle [D]stelle`
 * - Riga vuota = separa le strofe
 * - `{soc}` … `{eoc}` = ritornello
 * - `{c: testo}` = commento/indicazione
 *
 * Modulo puro (nessuna dipendenza da React/DB): usato dal lettore, dall'anteprima
 * dell'admin e dagli script di test.
 *
 * INDICI DELLE ANNOTAZIONI (contratto `song_annotations.data`):
 * - `line` = indice (da 0) della riga fisica nel body, cioè la posizione in
 *   `body.split("\n")` dopo aver normalizzato i fine riga (\r\n → \n). Contano
 *   anche righe vuote e direttive, così l'indice non dipende dal parser.
 * - `col` = indice (da 0, in unità UTF-16 come `String#length`) del carattere
 *   nel testo della riga dopo aver tolto gli accordi `[...]`.
 */

export type ChordPos = { col: number; chord: string };

export type LyricLine = {
  kind: "lyric";
  /** Indice della riga fisica nel body (vedi sopra). */
  index: number;
  /** Testo senza accordi. */
  text: string;
  /** Accordi con la colonna nel testo senza accordi, in ordine. */
  chords: ChordPos[];
  /** Riga con soli accordi (es. parte strumentale), anche separati da `|`. */
  chordOnly: boolean;
};

export type CommentLine = { kind: "comment"; index: number; text: string };

export type SongLine = LyricLine | CommentLine;

export type SectionKind = "verse" | "chorus" | "comment";

export type Section = { kind: SectionKind; lines: SongLine[] };

export type ParsedSong = {
  sections: Section[];
  /** Avvisi non bloccanti (per l'anteprima dell'admin). */
  warnings: string[];
};

const DIRECTIVE_RE = /^\{\s*([a-zA-Z_]+)\s*(?::\s*(.*?))?\s*\}$/;

/** Normalizza i fine riga e restituisce le righe fisiche del body. */
export function bodyLines(body: string): string[] {
  return body.replace(/\r\n?/g, "\n").split("\n");
}

/** Separa testo e accordi di una singola riga. */
export function parseLyricLine(raw: string): { text: string; chords: ChordPos[] } {
  let text = "";
  const chords: ChordPos[] = [];
  let i = 0;
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === "[") {
      const end = raw.indexOf("]", i + 1);
      // Una "[" senza chiusura (o con un'altra "[" prima della chiusura) è testo.
      const nextOpen = raw.indexOf("[", i + 1);
      if (end !== -1 && (nextOpen === -1 || nextOpen > end)) {
        const chord = chordFromItalian(raw.slice(i + 1, end).trim());
        if (chord) chords.push({ col: text.length, chord });
        i = end + 1;
        continue;
      }
    }
    text += ch;
    i++;
  }
  // Gli spazi finali si tolgono solo se la riga ha testo: nelle righe di soli
  // accordi gli spazi servono a distanziarli.
  if (text.trim() !== "") text = text.replace(/\s+$/, "");
  return {
    text,
    chords: chords.map((c) => ({ col: Math.min(c.col, text.length), chord: c.chord })),
  };
}

/**
 * Lingue del canto, nell'ordine in cui compaiono: ogni `{lang: Nome}` apre la
 * versione in quella lingua fino al successivo `{lang: …}`.
 */
export function songLanguages(body: string): string[] {
  const out: string[] = [];
  for (const raw of bodyLines(body)) {
    const m = raw.trim().match(DIRECTIVE_RE);
    const name = m && m[1].toLowerCase() === "lang" ? (m[2] ?? "").trim() : "";
    if (name && !out.includes(name)) out.push(name);
  }
  return out;
}

/**
 * Analizza il canto. Con `lang` restituisce solo le righe comuni (prima del primo
 * `{lang: …}`) e quelle della lingua scelta; gli indici di riga restano quelli del body.
 */
export function parseChordPro(body: string, lang?: string | null): ParsedSong {
  const lines = bodyLines(body);
  const sections: Section[] = [];
  const warnings: string[] = [];
  let inChorus = false;
  let current: Section | null = null;
  let currentLang: string | null = null;

  const close = () => {
    if (current && current.lines.length > 0) {
      if (current.kind !== "chorus" && current.lines.every((l) => l.kind === "comment")) {
        current.kind = "comment";
      }
      sections.push(current);
    }
    current = null;
  };
  const push = (line: SongLine) => {
    if (!current) current = { kind: inChorus ? "chorus" : "verse", lines: [] };
    current.lines.push(line);
  };

  lines.forEach((raw, index) => {
    const trimmed = raw.trim();
    const directive = trimmed.match(DIRECTIVE_RE);
    if (directive && directive[1].toLowerCase() === "lang") {
      close();
      currentLang = (directive[2] ?? "").trim() || null;
      return;
    }
    if (lang && currentLang && currentLang !== lang) return;
    if (trimmed === "") {
      close();
      return;
    }
    if (directive) {
      const name = directive[1].toLowerCase();
      const value = directive[2] ?? "";
      if (name === "soc" || name === "start_of_chorus") {
        close();
        if (inChorus) warnings.push(`Riga ${index + 1}: {soc} dentro un ritornello già aperto`);
        inChorus = true;
      } else if (name === "eoc" || name === "end_of_chorus") {
        close();
        if (!inChorus) warnings.push(`Riga ${index + 1}: {eoc} senza {soc}`);
        inChorus = false;
      } else if (name === "c" || name === "comment") {
        if (value) push({ kind: "comment", index, text: value });
      } else {
        warnings.push(`Riga ${index + 1}: direttiva {${name}} non supportata, ignorata`);
      }
      return;
    }
    const { text, chords } = parseLyricLine(raw);
    for (const c of chords) {
      if (!parseChord(c.chord)) {
        warnings.push(`Riga ${index + 1}: accordo "${c.chord}" non riconosciuto (non verrà trasposto)`);
      }
    }
    push({
      kind: "lyric",
      index,
      text,
      chords,
      chordOnly: isChordOnly(text, chords),
    });
  });
  close();
  if (inChorus) warnings.push("Ritornello aperto con {soc} ma mai chiuso con {eoc}");
  return { sections, warnings };
}

/** Senza testo, a parte spazi e separatori `|`: è una riga di soli accordi. */
function isChordOnly(text: string, chords: ChordPos[]): boolean {
  return chords.length > 0 && text.replace(/\|/g, "").trim() === "";
}

/** Riga strumentale come sequenza di accordi e separatori `|`, nell'ordine scritto. */
export function instrumentalTokens(line: LyricLine): ({ chord: string } | { bar: true })[] {
  const out: ({ chord: string } | { bar: true })[] = [];
  let next = 0;
  for (let col = 0; col <= line.text.length; col++) {
    while (next < line.chords.length && line.chords[next].col === col) out.push({ chord: line.chords[next++].chord });
    if (line.text[col] === "|") out.push({ bar: true });
  }
  return out;
}

/** Testo semplice del canto (senza accordi né direttive), per ricerca ed estratti. */
export function plainText(body: string): string {
  const out: string[] = [];
  for (const raw of bodyLines(body)) {
    const trimmed = raw.trim();
    if (DIRECTIVE_RE.test(trimmed)) continue;
    const { text, chords } = parseLyricLine(raw);
    out.push(isChordOnly(text, chords) ? "" : text.trim());
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Prima riga di testo (senza accordi), per gli estratti negli elenchi. */
export function firstLyric(body: string): string {
  return plainText(body).split("\n").find((l) => l.trim()) ?? "";
}

/** Minuscole e senza accenti, per una ricerca tollerante. */
export function normalizeSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’'`´]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ───────────────────────────── Accordi e trasposizione ─────────────────────────────

const NATURAL: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
/** Tonalità "neutre" (Do maggiore / La minore): nomi più comuni per ciascun semitono. */
const NEUTRAL_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

/** Nome della tonica per le tonalità maggiori / minori (per pitch class). */
const MAJOR_KEY_NAMES = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const MINOR_KEY_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

/** Pitch class delle tonalità maggiori / minori che si scrivono con i bemolli. */
const FLAT_MAJOR = new Set([5, 10, 3, 8, 1]); // F Bb Eb Ab Db
const FLAT_MINOR = new Set([2, 7, 0, 5, 10, 3]); // Dm Gm Cm Fm Bbm Ebm

export type Spelling = "sharp" | "flat" | "neutral";

type NoteParts = { letter: string; accidental: "" | "#" | "b" };
export type ParsedChord = { root: NoteParts; suffix: string; bass: NoteParts | null };

const CHORD_RE = /^([A-G])([#b]?)(.*?)(?:\/([A-G])([#b]?))?$/;

/** Analizza un accordo; null se non riconosciuto (es. "N.C."). */
export function parseChord(chord: string): ParsedChord | null {
  const m = chord.trim().match(CHORD_RE);
  if (!m) return null;
  // Il suffisso non deve contenere un altro basso malformato (es. "C/x").
  if (m[3].includes("/") && /\/[A-G]/.test(m[3])) return null;
  return {
    root: { letter: m[1], accidental: m[2] as NoteParts["accidental"] },
    suffix: m[3],
    bass: m[4] ? { letter: m[4], accidental: m[5] as NoteParts["accidental"] } : null,
  };
}

function pitchOf(n: NoteParts): number {
  const base = NATURAL[n.letter];
  const delta = n.accidental === "#" ? 1 : n.accidental === "b" ? -1 : 0;
  return (base + delta + 12) % 12;
}

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

function nameOf(pitch: number, spelling: Spelling): string {
  const table = spelling === "sharp" ? SHARP_NAMES : spelling === "flat" ? FLAT_NAMES : NEUTRAL_NAMES;
  return table[mod12(pitch)];
}

/** Tonalità analizzata: pitch class della tonica e modo. */
export type KeyInfo = { pitch: number; minor: boolean };

/**
 * Interpreta una tonalità scritta come accordo ("G", "Em", "F#m", "Bb")
 * o in forma estesa ("D minore", "Re", "La m"); null se non riconosciuta.
 */
export function parseKey(key: string | null | undefined): KeyInfo | null {
  if (!key) return null;
  let k = key.trim();
  // Solfeggio italiano → anglosassone
  const solf: [RegExp, string][] = [
    [/^do/i, "C"], [/^re/i, "D"], [/^mi/i, "E"], [/^fa/i, "F"],
    [/^sol/i, "G"], [/^la/i, "A"], [/^si/i, "B"],
  ];
  for (const [re, letter] of solf) {
    if (re.test(k) && !/^[A-G]([#b]|\s|m|$)/.test(k)) {
      k = k.replace(re, letter);
      break;
    }
  }
  k = k.replace(/♯|diesis/gi, "#").replace(/♭|bemolle/gi, "b");
  const m = k.match(/^([A-G])\s*([#b]?)\s*(.*)$/);
  if (!m) return null;
  const rest = m[3].trim().toLowerCase();
  const minor = /^(m(?!aj|ag)|-)/.test(rest);
  return {
    pitch: pitchOf({ letter: m[1], accidental: m[2] as NoteParts["accidental"] }),
    minor,
  };
}

/** Grafia degli accordi (diesis o bemolli) adatta a una tonalità. */
export function spellingForKey(key: KeyInfo | null): Spelling {
  if (!key) return "neutral";
  if (key.minor) {
    if (key.pitch === 9) return "neutral"; // La minore
    return FLAT_MINOR.has(key.pitch) ? "flat" : "sharp";
  }
  if (key.pitch === 0) return "neutral"; // Do maggiore
  return FLAT_MAJOR.has(key.pitch) ? "flat" : "sharp";
}

// ───────────────────────────── Notazione italiana ─────────────────────────────

const SOLFEGE: Record<string, string> = { C: "Do", D: "Re", E: "Mi", F: "Fa", G: "Sol", A: "La", B: "Si" };
const FROM_SOLFEGE: Record<string, string> = { Do: "C", Re: "D", Mi: "E", Fa: "F", Sol: "G", La: "A", Si: "B" };
const SOLFEGE_NOTE = "(Sol|Do|Re|Mi|Fa|La|Si)";
const ITALIAN_CHORD_RE = new RegExp(`^${SOLFEGE_NOTE}([#b♯♭]?)(.*?)(?:\\/${SOLFEGE_NOTE}([#b♯♭]?))?$`);

function asciiAccidental(a: string): string {
  return a === "♯" ? "#" : a === "♭" ? "b" : a;
}

/**
 * Converte un accordo scritto in italiano ("Lam7", "Fa#/La", "Sib") nella
 * notazione interna anglosassone; gli altri accordi restano invariati.
 */
export function chordFromItalian(chord: string): string {
  const m = chord.match(ITALIAN_CHORD_RE);
  if (!m) return chord;
  const bass = m[4] ? `/${FROM_SOLFEGE[m[4]]}${asciiAccidental(m[5])}` : "";
  return `${FROM_SOLFEGE[m[1]]}${asciiAccidental(m[2])}${m[3]}${bass}`;
}

function italianNote(n: NoteParts): string {
  return `${SOLFEGE[n.letter]}${n.accidental === "#" ? "♯" : n.accidental === "b" ? "♭" : ""}`;
}

/** Accordo da mostrare in notazione italiana: "Am7" → "Lam7", "D/F#" → "Re/Fa♯". */
export function italianChord(chord: string): string {
  const p = parseChord(chord);
  if (!p) return chord;
  return `${italianNote(p.root)}${p.suffix}${p.bass ? `/${italianNote(p.bass)}` : ""}`;
}

/** Nome della tonalità in italiano (es. "Mi♭", "Fa♯m"). */
export function italianKeyName(key: KeyInfo): string {
  return italianChord(keyName(key));
}

/** Nome della tonalità (es. "Eb", "F#m"). */
export function keyName(key: KeyInfo): string {
  return key.minor ? `${MINOR_KEY_NAMES[mod12(key.pitch)]}m` : MAJOR_KEY_NAMES[mod12(key.pitch)];
}

export function transposeKeyInfo(key: KeyInfo, semitones: number): KeyInfo {
  return { pitch: mod12(key.pitch + semitones), minor: key.minor };
}

/** Traspone il nome di una tonalità; restituisce l'originale se non riconosciuta. */
export function transposeKey(key: string, semitones: number): string {
  const info = parseKey(key);
  if (!info) return key;
  if (mod12(semitones) === 0) return key;
  return keyName(transposeKeyInfo(info, semitones));
}

/**
 * Traspone un accordo di `semitones` semitoni (positivi o negativi).
 * `spelling` sceglie diesis/bemolli (in genere da `spellingForKey` della tonalità di arrivo).
 * Gli accordi non riconosciuti e la trasposizione nulla restituiscono l'accordo invariato.
 */
export function transposeChord(chord: string, semitones: number, spelling: Spelling = "neutral"): string {
  if (mod12(semitones) === 0) return chord;
  const p = parseChord(chord);
  if (!p) return chord;
  const root = nameOf(pitchOf(p.root) + semitones, spelling);
  const bass = p.bass ? `/${nameOf(pitchOf(p.bass) + semitones, spelling)}` : "";
  return `${root}${p.suffix}${bass}`;
}

/** Tonalità del canto: quella dichiarata, altrimenti dedotta dal primo accordo. */
export function detectKey(song: ParsedSong, declared?: string | null): KeyInfo | null {
  const fromDeclared = parseKey(declared);
  if (fromDeclared) return fromDeclared;
  for (const s of song.sections) {
    for (const l of s.lines) {
      if (l.kind !== "lyric") continue;
      for (const c of l.chords) {
        const p = parseChord(c.chord);
        if (p) {
          return { pitch: pitchOf(p.root), minor: /^m(?!aj)/.test(p.suffix) };
        }
      }
    }
  }
  return null;
}

export function hasChords(song: ParsedSong): boolean {
  return song.sections.some((s) => s.lines.some((l) => l.kind === "lyric" && l.chords.length > 0));
}

/** Restituisce una copia del canto con tutti gli accordi trasposti. */
export function transposeSong(song: ParsedSong, semitones: number, declaredKey?: string | null): ParsedSong {
  if (mod12(semitones) === 0) return song;
  const key = detectKey(song, declaredKey);
  const spelling = spellingForKey(key ? transposeKeyInfo(key, semitones) : null);
  return {
    warnings: song.warnings,
    sections: song.sections.map((s) => ({
      kind: s.kind,
      lines: s.lines.map((l) =>
        l.kind === "lyric"
          ? { ...l, chords: l.chords.map((c) => ({ col: c.col, chord: transposeChord(c.chord, semitones, spelling) })) }
          : l
      ),
    })),
  };
}

/** Normalizza una trasposizione nell'intervallo −6…+5 (stessa altezza, meno salti). */
export function normalizeSemitones(n: number): number {
  const m = mod12(n);
  return m > 5 ? m - 12 : m;
}

// ───────────────────────────── Suddivisione per la resa ─────────────────────────────

/** Pezzo di riga: un accordo (opzionale) sopra un frammento di testo. */
export type LinePart = {
  /** Colonna di inizio nel testo senza accordi. */
  col: number;
  text: string;
  chord: string | null;
};

/** Parola (unità che non va spezzata a capo), composta da uno o più pezzi. */
export type LineWord = {
  /** Colonna di inizio della parola: è la `col` usata dalle annotazioni. */
  col: number;
  parts: LinePart[];
  /** true se la parola contiene lettere/numeri (annotabile). */
  annotatable: boolean;
};

/**
 * Divide una riga in parole e pezzi in modo che ogni accordo stia sopra il
 * carattere giusto e che il browser possa andare a capo solo tra le parole.
 * Gli spazi finali restano attaccati alla parola precedente.
 */
export function splitLine(line: LyricLine): LineWord[] {
  const { text, chords } = line;
  const words: LineWord[] = [];
  // Inizio di ogni parola: primo carattere non spazio dopo uno spazio (o a inizio riga).
  const wordStarts: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (!/\s/.test(text[i]) && (i === 0 || /\s/.test(text[i - 1]))) wordStarts.push(i);
  }
  if (wordStarts[0] !== 0) wordStarts.unshift(0); // spazi iniziali come "parola" a sé
  if (text.length === 0) wordStarts.length = 0;

  // Accordi oltre la fine del testo: vanno in coda.
  const byCol = new Map<number, string[]>();
  for (const c of chords) {
    const col = Math.min(c.col, text.length);
    byCol.set(col, [...(byCol.get(col) ?? []), c.chord]);
  }

  const bounds = [...wordStarts, text.length];
  for (let w = 0; w < wordStarts.length; w++) {
    const start = bounds[w];
    const end = bounds[w + 1];
    const cuts = new Set<number>([start]);
    for (const col of byCol.keys()) if (col > start && col < end) cuts.add(col);
    const sorted = [...cuts].sort((a, b) => a - b);
    const parts: LinePart[] = [];
    sorted.forEach((c, i) => {
      const next = i + 1 < sorted.length ? sorted[i + 1] : end;
      const list = byCol.get(c) ?? [];
      // Più accordi sulla stessa colonna: pezzi vuoti per tutti tranne l'ultimo.
      list.slice(0, -1).forEach((chord) => parts.push({ col: c, text: "", chord }));
      parts.push({ col: c, text: text.slice(c, next), chord: list.length ? list[list.length - 1] : null });
    });
    words.push({ col: start, parts, annotatable: /[\p{L}\p{N}]/u.test(text.slice(start, end)) });
  }

  // Accordi a fine riga (col === text.length), anche per righe di soli accordi.
  const tail = byCol.get(text.length);
  if (tail) {
    const parts = tail.map((chord) => ({ col: text.length, text: "", chord }));
    words.push({ col: text.length, parts, annotatable: false });
  }
  return words;
}
