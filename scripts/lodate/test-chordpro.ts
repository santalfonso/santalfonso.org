/**
 * Test del parser ChordPro ridotto.
 *
 * Uso: npx tsx scripts/lodate/test-chordpro.ts
 */
import assert from "node:assert/strict";
import {
  detectKey,
  firstLyric,
  keyName,
  normalizeSearch,
  normalizeSemitones,
  parseChord,
  parseChordPro,
  parseKey,
  parseLyricLine,
  plainText,
  spellingForKey,
  splitLine,
  transposeChord,
  transposeKey,
  transposeSong,
  type LyricLine,
} from "../../src/lib/lodate/chordpro";
import { seedSongs } from "./canti-seed";

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
  } catch (e) {
    console.error(`✗ ${name}`);
    throw e;
  }
}

// ─── Righe ───
test("accordi in linea e colonne nel testo senza accordi", () => {
  const r = parseLyricLine("[G]Tu scendi dalle [D]stelle");
  assert.equal(r.text, "Tu scendi dalle stelle");
  assert.deepEqual(r.chords, [
    { col: 0, chord: "G" },
    { col: 16, chord: "D" },
  ]);
});

test("accordo a metà parola", () => {
  const r = parseLyricLine("O Bam[C]bino mio di[G]vino,");
  assert.equal(r.text, "O Bambino mio divino,");
  assert.equal(r.chords[0].col, 5);
  assert.equal(r.text.slice(5), "bino mio divino,");
  assert.equal(r.text.slice(r.chords[1].col), "vino,");
});

test("accordo a fine riga e spazi finali", () => {
  const r = parseLyricLine("al freddo e al [G]gelo [D]   ");
  assert.equal(r.text, "al freddo e al gelo");
  assert.deepEqual(r.chords.map((c) => c.col), [15, 19]);
});

test("quadre non chiuse e quadre vuote", () => {
  assert.deepEqual(parseLyricLine("testo [senza chiusura"), { text: "testo [senza chiusura", chords: [] });
  assert.deepEqual(parseLyricLine("a [] b"), { text: "a  b", chords: [] });
  const r = parseLyricLine("x [[G]y");
  assert.equal(r.text, "x [y");
  assert.deepEqual(r.chords, [{ col: 3, chord: "G" }]);
});

test("accordi consecutivi sulla stessa colonna", () => {
  const r = parseLyricLine("[G][D]Do[G]mi[D]num");
  assert.equal(r.text, "Dominum");
  assert.deepEqual(r.chords, [
    { col: 0, chord: "G" },
    { col: 0, chord: "D" },
    { col: 2, chord: "G" },
    { col: 4, chord: "D" },
  ]);
});

test("caratteri accentati e apostrofi non spostano le colonne", () => {
  const r = parseLyricLine("Ah, [G]quanto ti co[D]stò l'avermi a[G]mato!");
  assert.equal(r.text, "Ah, quanto ti costò l'avermi amato!");
  assert.equal(r.text.slice(r.chords[1].col, r.chords[1].col + 3), "stò");
});

// ─── Struttura ───
const SAMPLE = [
  "{c: Strofa 1}", // 0
  "[G]Tu scendi dalle [D]stelle", // 1
  "e vieni in una grotta", // 2
  "", // 3
  "{soc}", // 4
  "[C]Rit. riga uno", // 5
  "", // 6
  "Rit. riga due", // 7
  "{eoc}", // 8
  "", // 9
  "{c: Tutti}", // 10
  "", // 11
  "Ultima {c: non è una direttiva}", // 12
].join("\r\n");

test("sezioni: strofa, ritornello (anche con riga vuota), commento", () => {
  const s = parseChordPro(SAMPLE);
  assert.deepEqual(
    s.sections.map((x) => x.kind),
    ["verse", "chorus", "chorus", "comment", "verse"]
  );
  assert.equal(s.warnings.length, 0);
  const first = s.sections[0];
  assert.equal(first.lines[0].kind, "comment");
  assert.equal(first.lines[0].text, "Strofa 1");
});

test("indice di riga = riga fisica del body (CRLF normalizzato)", () => {
  const s = parseChordPro(SAMPLE);
  const indexes = s.sections.flatMap((x) => x.lines.map((l) => l.index));
  assert.deepEqual(indexes, [0, 1, 2, 5, 7, 10, 12]);
  const line = s.sections[0].lines[1] as LyricLine;
  assert.equal(line.text, "Tu scendi dalle stelle");
});

test("avvisi: ritornello non chiuso, eoc orfano, direttiva sconosciuta, accordo strano", () => {
  const s = parseChordPro("{eoc}\n{soc}\n[H]la\n{title: X}");
  assert.equal(s.sections.length, 1);
  assert.equal(s.sections[0].kind, "chorus");
  assert.equal(s.warnings.length, 4);
});

test("body vuoto o solo spazi", () => {
  assert.deepEqual(parseChordPro("").sections, []);
  assert.deepEqual(parseChordPro("\n  \n\t\n").sections, []);
});

test("riga di soli accordi", () => {
  const s = parseChordPro("[G] [D] [G]\nTesto");
  const l = s.sections[0].lines[0] as LyricLine;
  assert.equal(l.chordOnly, true);
  assert.equal(l.chords.length, 3);
  assert.equal((s.sections[0].lines[1] as LyricLine).chordOnly, false);
});

test("testo semplice ed estratto", () => {
  assert.equal(plainText(SAMPLE).split("\n")[0], "Tu scendi dalle stelle");
  assert.equal(firstLyric("{c: Intro}\n[G] [D]\n[G]Adeste [D]fideles"), "Adeste fideles");
});

test("ricerca senza accenti e maiuscole", () => {
  assert.equal(normalizeSearch("  Perché  CANTIAMO à Te "), "perche cantiamo a te");
  assert.ok(normalizeSearch("L'avermi amato").includes("l avermi"));
});

// ─── Accordi ───
test("analisi accordi", () => {
  assert.deepEqual(parseChord("D/F#"), {
    root: { letter: "D", accidental: "" },
    suffix: "",
    bass: { letter: "F", accidental: "#" },
  });
  assert.equal(parseChord("Bbmaj7")?.suffix, "maj7");
  assert.equal(parseChord("C6/9")?.suffix, "6/9");
  assert.equal(parseChord("C6/9")?.bass, null);
  assert.equal(parseChord("N.C."), null);
  assert.equal(parseChord("H7"), null);
  assert.equal(parseChord("x"), null);
});

test("trasposizione semplice con suffissi e basso", () => {
  assert.equal(transposeChord("G", 2), "A");
  assert.equal(transposeChord("Am7", 3, "sharp"), "Cm7");
  assert.equal(transposeChord("D/F#", 2, "sharp"), "E/G#");
  assert.equal(transposeChord("D/F#", 1, "flat"), "Eb/G");
  assert.equal(transposeChord("Csus4", -1, "sharp"), "Bsus4");
  assert.equal(transposeChord("Fadd9", 12), "Fadd9");
  assert.equal(transposeChord("Ebdim", 0), "Ebdim");
  assert.equal(transposeChord("N.C.", 3), "N.C.");
});

test("trasposizione negativa e giro completo", () => {
  assert.equal(transposeChord("C", -1, "sharp"), "B");
  assert.equal(transposeChord("C", -2, "flat"), "Bb");
  for (const c of ["C", "C#", "Db", "F#m7", "Bb/D", "G#dim"]) {
    let x = c;
    for (let i = 0; i < 12; i++) x = transposeChord(x, 1, "sharp");
    // dopo 12 semitoni torna lo stesso accordo (eventualmente con grafia enarmonica)
    assert.equal(transposeChord(x, 1, "sharp"), transposeChord(c, 1, "sharp"));
  }
  assert.equal(transposeChord(transposeChord("F#m7", 5, "sharp"), -5, "sharp"), "F#m7");
  assert.equal(transposeChord(transposeChord("Bb/D", 3, "flat"), -3, "flat"), "Bb/D");
});

test("accidenti rari (Cb, E#, B#, Fb)", () => {
  assert.equal(transposeChord("Cb", 1, "sharp"), "C");
  assert.equal(transposeChord("E#", 1, "sharp"), "F#");
  assert.equal(transposeChord("B#", 2, "sharp"), "D");
  assert.equal(transposeChord("Fb", 1, "flat"), "F");
});

test("grafia diesis/bemolli in base alla tonalità di arrivo", () => {
  assert.equal(spellingForKey(parseKey("F")), "flat");
  assert.equal(spellingForKey(parseKey("Bb")), "flat");
  assert.equal(spellingForKey(parseKey("D")), "sharp");
  assert.equal(spellingForKey(parseKey("Dm")), "flat");
  assert.equal(spellingForKey(parseKey("Em")), "sharp");
  assert.equal(spellingForKey(parseKey("C")), "neutral");
  assert.equal(spellingForKey(parseKey("Am")), "neutral");
  assert.equal(spellingForKey(null), "neutral");
});

test("tonalità: analisi e trasposizione", () => {
  assert.deepEqual(parseKey("G"), { pitch: 7, minor: false });
  assert.deepEqual(parseKey("F#m"), { pitch: 6, minor: true });
  assert.deepEqual(parseKey("Bb maggiore"), { pitch: 10, minor: false });
  assert.deepEqual(parseKey("D minore"), { pitch: 2, minor: true });
  assert.deepEqual(parseKey("Re"), { pitch: 2, minor: false });
  assert.deepEqual(parseKey("Sol"), { pitch: 7, minor: false });
  assert.deepEqual(parseKey("Do"), { pitch: 0, minor: false });
  assert.deepEqual(parseKey("La minore"), { pitch: 9, minor: true });
  assert.deepEqual(parseKey("Sib"), { pitch: 10, minor: false });
  assert.equal(parseKey("boh"), null);
  assert.equal(parseKey(""), null);
  assert.equal(transposeKey("G", 2), "A");
  assert.equal(transposeKey("G", -2), "F");
  assert.equal(transposeKey("C", 1), "Db");
  assert.equal(transposeKey("Am", 1), "Bbm");
  assert.equal(transposeKey("Am", -3), "F#m");
  assert.equal(transposeKey("E", 2), "F#");
  assert.equal(transposeKey("G", 12), "G");
  assert.equal(transposeKey("boh", 3), "boh");
  assert.equal(keyName({ pitch: 8, minor: true }), "G#m");
});

test("trasposizione del canto con grafia coerente", () => {
  const song = parseChordPro("[G]Tu scendi [D/F#]dalle [Em]stelle [C]o [D7]Re");
  const up1 = transposeSong(song, 1, "G"); // → Ab: bemolli
  const chords = (up1.sections[0].lines[0] as LyricLine).chords.map((c) => c.chord);
  assert.deepEqual(chords, ["Ab", "Eb/G", "Fm", "Db", "Eb7"]);
  const up2 = transposeSong(song, 2, null); // tonalità dedotta: G → A, diesis
  assert.deepEqual(
    (up2.sections[0].lines[0] as LyricLine).chords.map((c) => c.chord),
    ["A", "E/G#", "F#m", "D", "E7"]
  );
  // l'originale non è modificato e le colonne restano le stesse
  assert.equal((song.sections[0].lines[0] as LyricLine).chords[0].chord, "G");
  assert.deepEqual(
    (up2.sections[0].lines[0] as LyricLine).chords.map((c) => c.col),
    (song.sections[0].lines[0] as LyricLine).chords.map((c) => c.col)
  );
  assert.equal(transposeSong(song, 0), song);
});

test("deduzione della tonalità dal primo accordo", () => {
  assert.deepEqual(detectKey(parseChordPro("{c: x}\n[Em]la [B7]la")), { pitch: 4, minor: true });
  assert.deepEqual(detectKey(parseChordPro("[Cmaj7]la")), { pitch: 0, minor: false });
  assert.equal(detectKey(parseChordPro("senza accordi")), null);
  assert.deepEqual(detectKey(parseChordPro("[Em]la"), "G"), { pitch: 7, minor: false });
});

test("normalizzazione semitoni", () => {
  assert.equal(normalizeSemitones(7), -5);
  assert.equal(normalizeSemitones(-7), 5);
  assert.equal(normalizeSemitones(12), 0);
  assert.equal(normalizeSemitones(6), -6);
});

// ─── Suddivisione per la resa ───
function lyric(raw: string): LyricLine {
  return parseChordPro(raw).sections[0].lines[0] as LyricLine;
}

test("splitLine: parole e pezzi ricompongono il testo", () => {
  const l = lyric("O Bam[C]bino mio di[G]vino,");
  const words = splitLine(l);
  assert.equal(words.map((w) => w.parts.map((p) => p.text).join("")).join(""), l.text);
  assert.deepEqual(words.map((w) => w.col), [0, 2, 10, 14]);
  const bambino = words[1];
  assert.deepEqual(bambino.parts.map((p) => [p.text, p.chord]), [["Bam", null], ["bino ", "C"]]);
  assert.ok(words.every((w) => w.annotatable));
});

test("splitLine: accordi a fine riga, sulla stessa colonna e solo accordi", () => {
  const end = splitLine(lyric("gelo [D]"));
  assert.equal(end.at(-1)?.parts[0].chord, "D");
  assert.equal(end.at(-1)?.annotatable, false);

  const same = splitLine(lyric("[G][D]Do[G]mi[D]num"));
  assert.deepEqual(same[0].parts.map((p) => [p.text, p.chord]), [["", "G"], ["Do", "D"], ["mi", "G"], ["num", "D"]]);

  const only = splitLine(lyric("[G] [D] [G]"));
  assert.deepEqual(only.flatMap((w) => w.parts.map((p) => p.chord)), ["G", "D", "G"]);
  assert.ok(only.every((w) => !w.annotatable));
});

test("splitLine: spazi iniziali e punteggiatura isolata", () => {
  const words = splitLine(lyric("  [G]ciao — mondo"));
  assert.equal(words[0].col, 0);
  assert.equal(words[0].annotatable, false);
  assert.equal(words[1].col, 2);
  assert.equal(words[1].parts[0].chord, "G");
  assert.equal(words.find((w) => w.parts[0].text.startsWith("—"))?.annotatable, false);
});

test("splitLine: le colonne delle parole corrispondono a text.indexOf", () => {
  const l = lyric("[G]Venite ado[D]remus, [G]venite ado[D]remus,");
  for (const w of splitLine(l)) {
    const t = w.parts.map((p) => p.text).join("").trim();
    if (t) assert.equal(l.text.indexOf(t, w.col), w.col);
  }
});

// ─── Tutti i canti del seed ───
test("seed: tutti i canti si analizzano senza avvisi e si traspongono", () => {
  for (const s of seedSongs) {
    const parsed = parseChordPro(s.body);
    assert.ok(parsed.sections.length > 0, s.slug);
    assert.deepEqual(parsed.warnings, [], s.slug);
    for (let n = -6; n <= 6; n++) transposeSong(parsed, n, s.musicalKey);
    for (const sec of parsed.sections) {
      for (const l of sec.lines) {
        if (l.kind !== "lyric") continue;
        const rebuilt = splitLine(l).map((w) => w.parts.map((p) => p.text).join("")).join("");
        assert.equal(rebuilt, l.text, `${s.slug} riga ${l.index}`);
      }
    }
  }
});

console.log(`✓ ${passed} test superati`);
