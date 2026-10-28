/**
 * Test di src/lib/lodate/setlist.ts
 * Uso: npx tsx scripts/lodate/test-setlist.ts
 */
import assert from "node:assert/strict";
import {
  LIMITS,
  allSongIds,
  decodeSetlist,
  emptySetlist,
  encodeSetlist,
  filterKnownSongs,
  extrasMetaToColumns,
  normalizeSetlist,
  orderedSections,
  rowsFromSetlist,
  setlistFromRows,
  todayInRome,
  formatLongDate,
  isValidIsoDate,
  type SetlistData,
} from "../../src/lib/lodate/setlist";

let passed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ok  ${name}`);
  } catch (e) {
    console.error(`  FAIL ${name}`);
    throw e;
  }
}

const sample: SetlistData = {
  ...emptySetlist(),
  title: "Messa degli sposi — Rossi/Bianchi",
  date: "2026-06-13",
  feast: "Matrimonio",
  notes: "Entrata sposa: organo\nComunione: 2 canti",
  items: {
    ...emptySetlist().items,
    iniziale: [3],
    gloria: [7],
    comunione: [12, 4],
    finale: [9],
  },
  extras: [
    { label: "Ingresso degli sposi", after: "inizio", songs: [21] },
    { label: "Scambio degli anelli", after: "gloria", songs: [] },
  ],
};

test("roundtrip encode/decode", () => {
  const enc = encodeSetlist(sample);
  assert.match(enc, /^2\.[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeSetlist(enc), normalizeSetlist(sample));
});

test("accenti e caratteri non ASCII sopravvivono", () => {
  const s = { ...sample, title: "Solennità dell'Immacolata – «Tota pulchra» ✝" };
  assert.equal(decodeSetlist(encodeSetlist(s))?.title, s.title);
});

test("link vuoto è corto", () => {
  assert.ok(encodeSetlist(emptySetlist()).length < 40);
});

test("versione sconosciuta o input rotto → null", () => {
  assert.equal(decodeSetlist("3.abc"), null);
  assert.equal(decodeSetlist("2.abc"), null);
  assert.equal(decodeSetlist("1.%%%"), null);
  assert.equal(decodeSetlist("1.bm90IGpzb24"), null); // "not json"
  assert.equal(decodeSetlist(""), null);
  assert.equal(decodeSetlist(undefined), null);
  assert.equal(decodeSetlist(["1.x"]), null);
  assert.equal(decodeSetlist("1." + "A".repeat(LIMITS.encoded)), null);
});

test("link v1 (un solo momento speciale) ancora leggibili", () => {
  const v1 = ["Sposi", "2026-06-13", "", "", "Ingresso", "inizio", [[3]], [21]];
  const d = decodeSetlist("1." + Buffer.from(JSON.stringify(v1)).toString("base64url"));
  assert.deepEqual(d?.items.iniziale, [3]);
  assert.deepEqual(d?.extras, [{ label: "Ingresso", after: "inizio", songs: [21] }]);
});

test("JSON valido ma non array → null", () => {
  const b64 = Buffer.from('{"a":1}').toString("base64url");
  assert.equal(decodeSetlist("1." + b64), null);
});

test("normalizzazione: id non validi, doppioni, limiti", () => {
  const n = normalizeSetlist({
    title: "  x  ",
    date: "2026-02-30",
    extraAfter: "boh",
    items: { iniziale: [1, 1, "2", -3, 0, 1.5, "x", 9e99], gloria: "no", pippo: [5] },
  });
  assert.equal(n.title, "x");
  assert.equal(n.date, null);
  assert.deepEqual(n.items.iniziale, [1, 2]);
  assert.deepEqual(n.items.gloria, []);
  assert.equal("pippo" in n.items, false);
  assert.deepEqual(n.extras, []);
});

test("limite canti per momento e totale", () => {
  const many = Array.from({ length: 30 }, (_, i) => i + 1);
  const n = normalizeSetlist({
    items: { iniziale: many, gloria: many, offertorio: many, santo: many, pace: many },
  });
  assert.equal(n.items.iniziale.length, LIMITS.songsPerMoment);
  assert.equal(allSongIds(n).length <= LIMITS.totalSongs, true);
  const total = Object.values(n.items).reduce((a, b) => a + b.length, 0);
  assert.equal(total, LIMITS.totalSongs);
});

test("testi lunghi tagliati, controlli rimossi", () => {
  const n = normalizeSetlist({ title: "a".repeat(500), notes: "riga1\nriga2\u0007", feast: "x\ty" });
  assert.equal(n.title.length, LIMITS.title);
  assert.equal(n.notes, "riga1\nriga2");
  assert.equal(n.feast, "x y");
});

test("date valide", () => {
  assert.ok(isValidIsoDate("2024-02-29"));
  assert.ok(!isValidIsoDate("2025-02-29"));
  assert.ok(!isValidIsoDate("2025-1-01"));
});

test("ordine sezioni: momenti speciali al loro posto, vuoti nascosti", () => {
  const order = orderedSections(normalizeSetlist(sample)).map((s) => s.key);
  assert.deepEqual(order, ["extra:0", "iniziale", "gloria", "comunione", "finale"]);
});

test("ordine sezioni con più momenti speciali (includeEmpty)", () => {
  const s = normalizeSetlist(sample);
  const order = orderedSections(s, true).map((x) => x.key);
  assert.deepEqual(order, [
    "extra:0", "iniziale", "gloria", "extra:1", "offertorio", "santo", "pace", "agnello", "comunione", "finale",
  ]);
  assert.equal(orderedSections(s, true)[3].label, "Scambio degli anelli");
});

test("nessun momento speciale se non definito", () => {
  const s = normalizeSetlist({ items: { santo: [1] } });
  assert.equal(orderedSections(s, true).some((x) => x.extraIndex !== null), false);
});

test("momento speciale senza nome → nome di default, dopo il finale", () => {
  const s = normalizeSetlist({ extras: [{ label: "  ", songs: [4] }] });
  assert.deepEqual(s.extras, [{ label: "Momento speciale", after: "finale", songs: [4] }]);
  assert.deepEqual(orderedSections(s).map((x) => x.key), ["extra:0"]);
});

test("al massimo LIMITS.extras momenti speciali", () => {
  const s = normalizeSetlist({ extras: Array.from({ length: 20 }, () => ({ label: "x" })) });
  assert.equal(s.extras.length, LIMITS.extras);
});

test("filterKnownSongs ignora id inesistenti", () => {
  const s = filterKnownSongs(normalizeSetlist(sample), new Set([3, 4, 21]));
  assert.deepEqual(s.items.comunione, [4]);
  assert.deepEqual(s.items.gloria, []);
  assert.deepEqual(s.extras[0].songs, [21]);
});

test("righe DB ↔ scaletta", () => {
  const n = normalizeSetlist(sample);
  const rows = rowsFromSetlist(n);
  assert.deepEqual(
    rows.filter((r) => r.moment === "comunione").map((r) => [r.songId, r.position]),
    [[12, 0], [4, 1]]
  );
  const row = { title: n.title, celebrationDate: n.date, feast: n.feast, notes: n.notes, ...extrasMetaToColumns(n.extras) };
  const back = setlistFromRows(row, [...rows.reverse(), { moment: "boh", songId: 1, position: 0 }]);
  assert.deepEqual(back, n);
});

test("scalette salvate col vecchio formato (un solo extra)", () => {
  const row = { title: "x", celebrationDate: null, feast: null, notes: null, extraLabel: "Ingresso", extraAfter: "gloria" };
  const back = setlistFromRows(row, [{ moment: "extra", songId: 5, position: 0 }]);
  assert.deepEqual(back.extras, [{ label: "Ingresso", after: "gloria", songs: [5] }]);
});

test("date in italiano e fuso di Roma", () => {
  assert.equal(formatLongDate("2026-11-29"), "domenica 29 novembre 2026");
  // 23:30 UTC del 31/12 = già 1° gennaio a Roma
  assert.equal(todayInRome(new Date("2026-12-31T23:30:00Z")), "2027-01-01");
});

console.log(`\n${passed} test superati`);
