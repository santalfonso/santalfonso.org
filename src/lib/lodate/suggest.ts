/**
 * Suggerimenti di canti per le letture del giorno: prima scelta locale dei canti
 * candidati (parole in comune tra letture e testi, più le etichette di momento e
 * tempo), poi il modello sceglie tra questi. Modulo puro, senza DB né rete.
 */

import { parseChordPro } from "@/lib/lodate/chordpro";
import { MOMENT_SLUGS } from "@/lib/lodate/constants";

export type SuggestSong = {
  id: number;
  title: string;
  body: string;
  moments: string[];
  seasons: string[];
};

export type Candidate = {
  id: number;
  title: string;
  moments: string[];
  seasons: string[];
  /** Inizio della prima strofa e del ritornello, per far capire il testo al modello. */
  excerpt: string;
  score: number;
};

const STOP = new Set(
  (
    "alla alle allo agli anche ancora avere aveva avete come con contro cosa cui dagli dai dal dalla dalle dallo degli dei del della delle dello dentro dopo dove dunque egli ella esse essere essi fino fra già gli hanno ieri il infatti io la le lei lo loro lui ma mai me mentre mi mia mie miei mio molto ne nei nel nella nelle nello noi non nostra nostre nostri nostro ogni oggi oppure ora per perché però più poi può qual quale quando quanto quella quelle quelli quello questa queste questi questo qui se sei senza sia siamo sono sopra sotto sta stato su sua sue sui sul sulla suo suoi tra tutta tutte tutti tutto una uno vostra vostro voi essere detto disse dice fratelli parola signore dio"
  ).split(" ")
);

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Radici delle parole significative (le prime 5 lettere, così "risorto" e "risorgere" coincidono). */
export function stems(text: string): string[] {
  const out: string[] = [];
  for (const w of fold(text).split(/[^a-z]+/)) {
    if (w.length < 4 || STOP.has(w)) continue;
    out.push(w.length > 5 ? w.slice(0, 5) : w);
  }
  return out;
}

function excerptOf(body: string): string {
  const song = parseChordPro(body);
  const textOf = (kind: string) =>
    song.sections
      .find((s) => s.kind === kind)
      ?.lines.filter((l) => l.kind === "lyric" && !l.chordOnly)
      .map((l) => l.text.trim())
      .join(" / ") ?? "";
  const verse = textOf("verse") || textOf("uomo") || textOf("donna");
  const chorus = textOf("chorus");
  const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);
  return [chorus && `Rit: ${cut(chorus, 110)}`, verse && cut(verse, 110)].filter(Boolean).join(" | ");
}

/**
 * Sceglie i canti da proporre al modello: i più vicini alle letture per testo,
 * più qualche canto etichettato per ogni momento (meglio se del tempo giusto).
 */
export function pickCandidates(
  songs: SuggestSong[],
  readingsText: string,
  season: string | null,
  { byText = 28, perMoment = 3, max = 48 } = {}
): Candidate[] {
  const readCount = new Map<string, number>();
  for (const s of stems(readingsText)) readCount.set(s, (readCount.get(s) ?? 0) + 1);

  const songStems = songs.map((s) => new Set(stems(`${s.title} ${s.title} ${s.body.replace(/\[[^\]]*\]|\{[^}]*\}/g, " ")}`)));
  const df = new Map<string, number>();
  for (const set of songStems) for (const s of set) df.set(s, (df.get(s) ?? 0) + 1);

  const n = songs.length || 1;
  const scored = songs.map((song, i) => {
    let score = 0;
    for (const s of songStems[i]) {
      const c = readCount.get(s);
      if (c) score += Math.log(n / (df.get(s) ?? 1)) * (1 + Math.log(c));
    }
    score /= Math.sqrt(songStems[i].size || 1);
    if (season && song.seasons.includes(season)) score += 0.6;
    return { song, score };
  });

  const chosen = new Map<number, number>();
  [...scored].sort((a, b) => b.score - a.score).slice(0, byText).forEach((x) => chosen.set(x.song.id, x.score));
  for (const moment of MOMENT_SLUGS) {
    scored
      .filter((x) => x.song.moments.includes(moment))
      .sort((a, b) => b.score - a.score)
      .slice(0, perMoment)
      .forEach((x) => chosen.set(x.song.id, x.score));
  }

  return scored
    .filter((x) => chosen.has(x.song.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map(({ song, score }) => ({
      id: song.id,
      title: song.title,
      moments: song.moments,
      seasons: song.seasons,
      excerpt: excerptOf(song.body),
      score,
    }));
}
