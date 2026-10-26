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
  itemsFromRows,
  normalizeSetlist,
  orderedSections,
  rowsFromItems,
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
  extraLabel: "Ingresso degli sposi",
  extraAfter: "inizio",
  items: {
    ...emptySetlist().items,
    iniziale: [3],
    gloria: [7],
    comunione: [12, 4],
    finale: [9],
    extra: [21],
  },
};

test("roundtrip encode/decode", () => {
  const enc = encodeSetlist(sample);
  assert.match(enc, /^1\.[A-Za-z0-9_-]+$/);
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
  assert.equal(decodeSetlist("2.abc"), null);
  assert.equal(decodeSetlist("1.%%%"), null);
  assert.equal(decodeSetlist("1.bm90IGpzb24"), null); // "not json"
  assert.equal(decodeSetlist(""), null);
  assert.equal(decodeSetlist(undefined), null);
  assert.equal(decodeSetlist(["1.x"]), null);
  assert.equal(decodeSetlist("1." + "A".repeat(LIMITS.encoded)), null);
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
  assert.equal(n.extraLabel, null);
  assert.equal(n.extraAfter, null);
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

test("ordine sezioni con extra all'inizio", () => {
  const order = orderedSections(normalizeSetlist(sample)).map((s) => s.moment);
  assert.deepEqual(order, ["extra", "iniziale", "gloria", "comunione", "finale"]);
});

test("ordine sezioni con extra dopo la gloria (includeEmpty)", () => {
  const s = normalizeSetlist({ ...sample, extraAfter: "gloria" });
  const order = orderedSections(s, true).map((x) => x.moment);
  assert.deepEqual(order, [
    "iniziale", "gloria", "extra", "offertorio", "santo", "pace", "agnello", "comunione", "finale",
  ]);
  assert.equal(orderedSections(s, true)[2].label, "Ingresso degli sposi");
});

test("nessun extra se non definito", () => {
  const s = normalizeSetlist({ items: { santo: [1] } });
  assert.deepEqual(orderedSections(s, true).map((x) => x.moment).includes("extra"), false);
});

test("extra con canti ma senza etichetta → etichetta di default, dopo il finale", () => {
  const s = normalizeSetlist({ items: { extra: [4] } });
  assert.equal(s.extraLabel, "Momento speciale");
  assert.equal(s.extraAfter, "finale");
  assert.deepEqual(orderedSections(s).map((x) => x.moment), ["extra"]);
});

test("filterKnownSongs ignora id inesistenti", () => {
  const s = filterKnownSongs(normalizeSetlist(sample), new Set([3, 4, 21]));
  assert.deepEqual(s.items.comunione, [4]);
  assert.deepEqual(s.items.gloria, []);
  assert.deepEqual(s.items.extra, [21]);
});

test("righe DB ↔ items", () => {
  const n = normalizeSetlist(sample);
  const rows = rowsFromItems(n.items);
  assert.deepEqual(
    rows.filter((r) => r.moment === "comunione").map((r) => [r.songId, r.position]),
    [[12, 0], [4, 1]]
  );
  const back = itemsFromRows([...rows.reverse(), { moment: "boh", songId: 1, position: 0 }]);
  assert.deepEqual(back, n.items);
});

test("date in italiano e fuso di Roma", () => {
  assert.equal(formatLongDate("2026-11-29"), "domenica 29 novembre 2026");
  // 23:30 UTC del 31/12 = già 1° gennaio a Roma
  assert.equal(todayInRome(new Date("2026-12-31T23:30:00Z")), "2027-01-01");
});

console.log(`\n${passed} test superati`);
