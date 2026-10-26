/**
 * Test di src/lib/lodate/liturgia.ts (calendario romano, Italia, Roma).
 * Uso: npx tsx scripts/lodate/test-liturgia.ts
 */
import assert from "node:assert/strict";
import {
  easterDate,
  firstSundayOfAdvent,
  liturgicalDay,
  movableDates,
  readingsLinks,
  seasonForDate,
} from "../../src/lib/lodate/liturgia";

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

function day(iso: string) {
  return liturgicalDay(iso);
}

test("Pasqua (computus)", () => {
  assert.equal(easterDate(2008), "2008-03-23");
  assert.equal(easterDate(2025), "2025-04-20");
  assert.equal(easterDate(2026), "2026-04-05");
  assert.equal(easterDate(2027), "2027-03-28");
  assert.equal(easterDate(2028), "2028-04-16");
  assert.equal(easterDate(2038), "2038-04-25");
});

test("date mobili 2026 (Italia)", () => {
  const m = movableDates(2026);
  assert.equal(m.ashWednesday, "2026-02-18");
  assert.equal(m.ascension, "2026-05-17");
  assert.equal(m.pentecost, "2026-05-24");
  assert.equal(m.corpusDomini, "2026-06-07");
  assert.equal(m.advent1, "2026-11-29");
  assert.equal(m.christTheKing, "2026-11-22");
  assert.equal(firstSundayOfAdvent(2025), "2025-11-30");
});

test("Ceneri 2026", () => {
  const d = day("2026-02-18");
  assert.equal(d.title, "Mercoledì delle Ceneri");
  assert.equal(d.season, "quaresima");
  assert.equal(d.color, "viola");
  assert.equal(d.psalterWeek, 4);
});

test("Pentecoste 2026", () => {
  const d = day("2026-05-24");
  assert.equal(d.title, "Domenica di Pentecoste");
  assert.equal(d.color, "rosso");
  assert.equal(d.rank, "solennità");
  assert.equal(d.songSeason, "spirito-santo");
});

test("Ascensione la domenica (Italia)", () => {
  assert.equal(day("2026-05-17").title, "Ascensione del Signore");
  assert.equal(day("2026-05-14").title, "Giovedì della VI settimana di Pasqua");
});

test("I domenica di Avvento 2026 apre l'anno B", () => {
  const d = day("2026-11-29");
  assert.equal(d.title, "I domenica di Avvento");
  assert.equal(d.sundayCycle, "B");
  assert.equal(d.weekdayCycle, "I");
  assert.equal(d.liturgicalYear, 2027);
  assert.equal(d.color, "viola");
});

test("XXXII domenica T.O. 2026, anno A, feriale II", () => {
  const d = day("2026-11-08");
  assert.equal(d.title, "XXXII domenica del Tempo ordinario");
  assert.equal(d.sundayCycle, "A");
  assert.equal(d.weekdayCycle, "II");
  assert.equal(d.color, "verde");
});

test("oggi 2026-10-26: lunedì della XXX settimana T.O.", () => {
  const d = day("2026-10-26");
  assert.equal(d.title, "Lunedì della XXX settimana del Tempo ordinario");
  assert.equal(d.psalterWeek, 2);
});

test("Tutti i Santi e Cristo Re 2026", () => {
  assert.equal(day("2026-11-01").title, "Tutti i Santi");
  assert.equal(day("2026-11-01").rank, "solennità");
  assert.equal(day("2026-11-22").title, "Nostro Signore Gesù Cristo Re dell'universo");
  assert.equal(day("2026-11-22").week, 34);
});

test("2/11 di domenica (2025) prevale sulla domenica T.O.", () => {
  const d = day("2025-11-02");
  assert.equal(d.title, "Commemorazione di tutti i fedeli defunti");
  assert.equal(d.color, "viola");
});

test("Laterano 9/11 è solennità a Roma", () => {
  assert.equal(day("2025-11-09").title, "Dedicazione della Basilica Lateranense");
});

test("ripresa del T.O. dopo Pentecoste 2026 alla settimana VIII", () => {
  assert.equal(day("2026-05-25").week, 8);
  assert.equal(day("2026-05-25").title, "Beata Vergine Maria Madre della Chiesa");
  assert.equal(day("2026-05-26").title, "Martedì della VIII settimana del Tempo ordinario");
});

test("prima parte del T.O.: settimane dopo il Battesimo", () => {
  // 2026: Battesimo domenica 11/1
  assert.equal(day("2026-01-11").title, "Battesimo del Signore");
  assert.equal(day("2026-01-12").title, "Lunedì della I settimana del Tempo ordinario");
  assert.equal(day("2026-01-18").title, "II domenica del Tempo ordinario");
  assert.equal(day("2026-02-17").week, 6);
});

test("Natale, Epifania (6/1) e Battesimo", () => {
  assert.equal(day("2026-12-25").title, "Natale del Signore");
  assert.equal(day("2026-12-25").rank, "solennità");
  assert.equal(day("2027-01-06").title, "Epifania del Signore");
  assert.equal(day("2027-01-01").title, "Maria Santissima Madre di Dio");
  // 2030: 6/1 è domenica → Battesimo domenica 13/1
  assert.equal(day("2030-01-06").title, "Epifania del Signore");
  assert.equal(day("2030-01-13").title, "Battesimo del Signore");
});

test("Santa Famiglia: domenica fra l'ottava o 30/12", () => {
  assert.equal(day("2026-12-27").title, "Santa Famiglia di Gesù, Maria e Giuseppe");
  assert.equal(day("2033-12-30").title, "Santa Famiglia di Gesù, Maria e Giuseppe");
});

test("III Avvento rosaceo, IV Quaresima rosaceo, Palme rosso", () => {
  assert.equal(day("2026-12-13").color, "rosaceo");
  assert.equal(day("2026-03-15").color, "rosaceo");
  assert.equal(day("2026-03-29").title, "Domenica delle Palme e della Passione del Signore");
  assert.equal(day("2026-03-29").color, "rosso");
  assert.equal(day("2026-04-03").color, "rosso");
  assert.equal(day("2026-04-03").season, "triduo");
});

test("Immacolata di domenica in Avvento → lunedì 9/12 (2030)", () => {
  assert.equal(day("2030-12-08").title, "II domenica di Avvento");
  assert.equal(day("2030-12-09").title, "Immacolata Concezione della Beata Vergine Maria");
});

test("San Giuseppe di domenica in Quaresima → lunedì (2028)", () => {
  assert.equal(day("2028-03-19").title, "III domenica di Quaresima");
  assert.equal(day("2028-03-20").title, "San Giuseppe, sposo della Beata Vergine Maria");
});

test("Annunciazione nella Settimana santa → lunedì dopo la II di Pasqua (2027)", () => {
  assert.equal(day("2027-03-25").title, "Giovedì santo — Messa nella Cena del Signore");
  assert.equal(day("2027-04-05").title, "Annunciazione del Signore");
});

test("feste dei santi non sostituiscono la domenica T.O.", () => {
  // 4/10/2026 è domenica: XXVII domenica, non San Francesco
  assert.equal(day("2026-10-04").title, "XXVII domenica del Tempo ordinario");
  assert.equal(day("2027-10-04").title, "San Francesco d'Assisi, patrono d'Italia");
});

test("feste del Signore sostituiscono la domenica T.O.", () => {
  // 6/8/2028 è domenica
  assert.equal(day("2028-08-06").title, "Trasfigurazione del Signore");
});

test("Sant'Alfonso 1/8 solennità del titolare", () => {
  assert.equal(day("2026-08-01").rank, "solennità");
});

test("ottava di Pasqua e Divina Misericordia", () => {
  assert.equal(day("2026-04-06").title, "Lunedì fra l'ottava di Pasqua");
  assert.equal(day("2026-04-12").title, "II domenica di Pasqua (della Divina Misericordia)");
});

test("seasonForDate per i suggerimenti", () => {
  assert.equal(seasonForDate("2026-12-01"), "avvento");
  assert.equal(seasonForDate("2026-08-15"), "maria");
  assert.equal(seasonForDate("2026-13-01"), null);
});

test("link alle letture: CEI entro 6 settimane, poi lachiesa.it", () => {
  const near = readingsLinks("2026-11-01", "2026-10-26");
  assert.equal(near.primary.href, "https://www.chiesacattolica.it/liturgia-del-giorno/?data-liturgia=20261101");
  assert.equal(near.secondary.href, "https://www.lachiesa.it/calendario/20261101.html");
  const far = readingsLinks("2027-01-10", "2026-10-26");
  assert.match(far.primary.href, /lachiesa\.it/);
});

test("ogni giorno 2025-2030 è calcolabile e coerente", () => {
  let d = new Date(Date.UTC(2025, 0, 1));
  const end = Date.UTC(2031, 0, 1);
  while (d.getTime() < end) {
    const iso = d.toISOString().slice(0, 10);
    const r = liturgicalDay(iso);
    assert.ok(r.title.length > 0, iso);
    if (r.season === "ordinario") assert.ok(r.week! >= 1 && r.week! <= 34, `${iso} settimana ${r.week}`);
    if (r.season === "avvento") assert.ok(r.week! >= 1 && r.week! <= 4, iso);
    if (r.season === "quaresima" && r.week !== null) assert.ok(r.week >= 1 && r.week <= 6, iso);
    d = new Date(d.getTime() + 86_400_000);
  }
});

console.log(`\n${passed} test superati`);
