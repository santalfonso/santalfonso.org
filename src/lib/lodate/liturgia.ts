/**
 * Calcolo locale del giorno liturgico (Rito romano, calendario italiano).
 *
 * - Pasqua col computus gregoriano; tempi, settimane, ciclo festivo A/B/C e feriale I/II;
 * - colore liturgico; principali solennità e feste del Signore con le regole di
 *   trasferimento più comuni;
 * - regole italiane: Epifania il 6 gennaio, Ascensione e Corpus Domini la domenica.
 *
 * Non contiene né ripubblica testi biblici o liturgici: per le letture si rimanda
 * alla fonte ufficiale (vedi `officialReadingsUrl`).
 * Pura (nessuna dipendenza da Node/browser): usabile lato server e client.
 */
import type { Season } from "./constants";

export type LiturgicalSeason = "avvento" | "natale" | "ordinario" | "quaresima" | "triduo" | "pasqua";
export type LiturgicalColor = "verde" | "viola" | "bianco" | "rosso" | "rosaceo" | "nero";
export type LiturgicalRank = "solennità" | "festa" | "memoria" | "domenica" | "feria";

export type LiturgicalDay = {
  date: string;
  weekday: string;
  isSunday: boolean;
  season: LiturgicalSeason;
  seasonLabel: string;
  /** Settimana del tempo (I, II…); null nell'ottava/tempo di Natale e nel Triduo. */
  week: number | null;
  /** Settimana del salterio (1-4); null nel Tempo di Natale e nel Triduo. */
  psalterWeek: number | null;
  /** Nome del giorno: celebrazione oppure domenica/feria del tempo. */
  title: string;
  /** Domenica o feria del tempo, quando `title` è una celebrazione che la sostituisce. */
  dayOfSeason: string;
  rank: LiturgicalRank;
  color: LiturgicalColor;
  /** Anno liturgico (es. 2027 = dall'Avvento 2026 all'Avvento 2027). */
  liturgicalYear: number;
  sundayCycle: "A" | "B" | "C";
  weekdayCycle: "I" | "II";
  /** Categoria dei canti più adatta (per i suggerimenti nel builder). */
  songSeason: Season;
};

// ───────────────────────────── utilità date ─────────────────────────────

const DAY = 86_400_000;
/** Giorni dall'epoca Unix (UTC) — aritmetica senza fusi orari. */
type DayNum = number;

function dn(y: number, m: number, d: number): DayNum {
  return Math.round(Date.UTC(y, m - 1, d) / DAY);
}
function toIso(n: DayNum): string {
  return new Date(n * DAY).toISOString().slice(0, 10);
}
function parseIso(iso: string): DayNum | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 1583 || y > 4099) return null;
  const n = dn(y, mo, d);
  return toIso(n) === iso ? n : null;
}
/** 0 = domenica … 6 = sabato */
function dow(n: DayNum): number {
  return (((n + 4) % 7) + 7) % 7; // 1970-01-01 era giovedì
}
function yearOf(n: DayNum): number {
  return new Date(n * DAY).getUTCFullYear();
}

export function addDays(iso: string, days: number): string {
  const n = parseIso(iso);
  if (n === null) throw new Error(`Data non valida: ${iso}`);
  return toIso(n + days);
}

export function isValidLiturgicalDate(iso: string): boolean {
  return parseIso(iso) !== null;
}

// ───────────────────────────── date mobili ─────────────────────────────

/** Domenica di Pasqua (algoritmo anonimo gregoriano / Meeus-Jones-Butcher). */
export function easterDate(year: number): string {
  return toIso(easter(year));
}
function easter(year: number): DayNum {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return dn(year, month, day);
}

/** Prima domenica di Avvento: la quarta domenica prima di Natale. */
function advent1(year: number): DayNum {
  const christmas = dn(year, 12, 25);
  const back = dow(christmas) || 7;
  return christmas - back - 21;
}
export function firstSundayOfAdvent(year: number): string {
  return toIso(advent1(year));
}

/** Battesimo del Signore: domenica dopo il 6 gennaio (Epifania fissa, Italia). */
function baptism(year: number): DayNum {
  const epiphany = dn(year, 1, 6);
  return epiphany + (7 - dow(epiphany) || 7);
}

/** Santa Famiglia: domenica fra l'ottava di Natale, o 30 dicembre se non c'è. */
function holyFamily(year: number): DayNum {
  const christmas = dn(year, 12, 25);
  if (dow(christmas) === 0) return dn(year, 12, 30);
  return christmas + (7 - dow(christmas));
}

export type MovableDates = Record<
  | "ashWednesday"
  | "palmSunday"
  | "holyThursday"
  | "goodFriday"
  | "holySaturday"
  | "easter"
  | "divineMercy"
  | "ascension"
  | "pentecost"
  | "trinity"
  | "corpusDomini"
  | "sacredHeart"
  | "christTheKing"
  | "advent1"
  | "baptism"
  | "holyFamily",
  string
>;

export function movableDates(year: number): MovableDates {
  const e = easter(year);
  const a1 = advent1(year);
  return {
    ashWednesday: toIso(e - 46),
    palmSunday: toIso(e - 7),
    holyThursday: toIso(e - 3),
    goodFriday: toIso(e - 2),
    holySaturday: toIso(e - 1),
    easter: toIso(e),
    divineMercy: toIso(e + 7),
    ascension: toIso(e + 42), // Italia: VII domenica di Pasqua
    pentecost: toIso(e + 49),
    trinity: toIso(e + 56),
    corpusDomini: toIso(e + 63), // Italia: domenica
    sacredHeart: toIso(e + 68),
    christTheKing: toIso(a1 - 7),
    advent1: toIso(a1),
    baptism: toIso(baptism(year)),
    holyFamily: toIso(holyFamily(year)),
  };
}

// ───────────────────────────── testi ─────────────────────────────

const WEEKDAYS = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const SEASON_LABELS: Record<LiturgicalSeason, string> = {
  avvento: "Avvento",
  natale: "Tempo di Natale",
  ordinario: "Tempo ordinario",
  quaresima: "Quaresima",
  triduo: "Triduo pasquale",
  pasqua: "Tempo di Pasqua",
};

export function roman(n: number): string {
  const map: [number, string][] = [
    [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let out = "";
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

const OF_SEASON: Record<"avvento" | "ordinario" | "quaresima" | "pasqua", string> = {
  avvento: "di Avvento",
  ordinario: "del Tempo ordinario",
  quaresima: "di Quaresima",
  pasqua: "di Pasqua",
};

function seasonDayName(season: keyof typeof OF_SEASON, week: number, weekday: number): string {
  return weekday === 0
    ? `${roman(week)} domenica ${OF_SEASON[season]}`
    : `${WEEKDAYS[weekday]} della ${roman(week)} settimana ${OF_SEASON[season]}`;
}

// ───────────────────────────── celebrazioni ─────────────────────────────

type Celebration = { name: string; rank: "solennità" | "festa" | "memoria"; color: LiturgicalColor; songSeason?: Season; lord?: boolean };

/** Celebrazioni a data fissa (calendario generale + Italia + titolare della parrocchia). */
const FIXED: Record<string, Celebration> = {
  "01-01": { name: "Maria Santissima Madre di Dio", rank: "solennità", color: "bianco", songSeason: "maria" },
  "01-06": { name: "Epifania del Signore", rank: "solennità", color: "bianco", lord: true },
  "02-02": { name: "Presentazione del Signore", rank: "festa", color: "bianco", lord: true },
  "02-22": { name: "Cattedra di San Pietro apostolo", rank: "festa", color: "bianco" },
  "03-19": { name: "San Giuseppe, sposo della Beata Vergine Maria", rank: "solennità", color: "bianco" },
  "03-25": { name: "Annunciazione del Signore", rank: "solennità", color: "bianco", songSeason: "maria", lord: true },
  "04-29": { name: "Santa Caterina da Siena, patrona d'Italia", rank: "festa", color: "bianco" },
  "06-24": { name: "Natività di San Giovanni Battista", rank: "solennità", color: "bianco" },
  "06-29": { name: "Santi Pietro e Paolo, apostoli", rank: "solennità", color: "rosso" },
  "08-01": { name: "Sant'Alfonso Maria de' Liguori, titolare della parrocchia", rank: "solennità", color: "bianco" },
  "08-06": { name: "Trasfigurazione del Signore", rank: "festa", color: "bianco", lord: true },
  "08-15": { name: "Assunzione della Beata Vergine Maria", rank: "solennità", color: "bianco", songSeason: "maria" },
  "09-14": { name: "Esaltazione della Santa Croce", rank: "festa", color: "rosso", lord: true },
  "10-04": { name: "San Francesco d'Assisi, patrono d'Italia", rank: "festa", color: "bianco" },
  "11-01": { name: "Tutti i Santi", rank: "solennità", color: "bianco" },
  "11-02": { name: "Commemorazione di tutti i fedeli defunti", rank: "solennità", color: "viola", songSeason: "funerali" },
  // a Roma è solennità (cattedrale della diocesi)
  "11-09": { name: "Dedicazione della Basilica Lateranense", rank: "solennità", color: "bianco", lord: true },
  "12-08": { name: "Immacolata Concezione della Beata Vergine Maria", rank: "solennità", color: "bianco", songSeason: "maria" },
  "12-25": { name: "Natale del Signore", rank: "solennità", color: "bianco", lord: true },
  "12-26": { name: "Santo Stefano, primo martire", rank: "festa", color: "rosso" },
  "12-27": { name: "San Giovanni, apostolo ed evangelista", rank: "festa", color: "bianco" },
  "12-28": { name: "Santi Innocenti, martiri", rank: "festa", color: "rosso" },
};

/**
 * Data effettiva (con trasferimenti) delle solennità fisse che possono cadere
 * in giorni impediti. Restituisce una mappa DayNum → chiave "MM-DD".
 */
function fixedForYear(year: number): Map<DayNum, string> {
  const e = easter(year);
  const ash = e - 46;
  const palm = e - 7;
  const a1 = advent1(year);
  const sacredHeart = e + 68;
  const out = new Map<DayNum, string>();

  for (const key of Object.keys(FIXED)) {
    const [m, d] = key.split("-").map(Number);
    let day = dn(year, m, d);

    if (key === "03-19") {
      if (day >= palm && day <= e + 7) day = palm - 1; // Settimana santa → sabato prima delle Palme
      else if (day >= ash && dow(day) === 0) day += 1; // domenica di Quaresima → lunedì
    } else if (key === "03-25") {
      if (day >= palm && day <= e + 7) day = e + 8; // Settimana santa/ottava → lunedì dopo la II di Pasqua
      else if (day >= ash && dow(day) === 0) day += 1;
    } else if (key === "12-08") {
      if (dow(day) === 0 && day >= a1) day += 1; // domenica di Avvento → 9 dicembre
    } else if (key === "06-24" && day === sacredHeart) {
      day -= 1;
    }
    out.set(day, key);
  }
  return out;
}

// ───────────────────────────── calcolo del giorno ─────────────────────────────

export function liturgicalDay(iso: string): LiturgicalDay {
  const n = parseIso(iso);
  if (n === null) throw new Error(`Data non valida: ${iso}`);
  const y = yearOf(n);
  const wd = dow(n);
  const isSunday = wd === 0;

  const e = easter(y);
  const ash = e - 46;
  const lent1 = ash + 4;
  const palm = e - 7;
  const pentecost = e + 49;
  const a1 = advent1(y);
  const bapt = baptism(y);
  const christmas = dn(y, 12, 25);

  const liturgicalYear = n >= a1 ? y + 1 : y;
  const sundayCycle = (["C", "A", "B"] as const)[liturgicalYear % 3];
  const weekdayCycle = liturgicalYear % 2 === 1 ? "I" : "II";

  // ── tempo e giorno del tempo ──
  let season: LiturgicalSeason;
  let week: number | null = null;
  let dayOfSeason: string;
  let color: LiturgicalColor;
  let rank: LiturgicalRank = isSunday ? "domenica" : "feria";
  let songSeason: Season;
  let privileged = false; // giorni che prevalgono sulle solennità (Triduo, Settimana santa, ottava di Pasqua, Ceneri, domeniche "forti")

  if (n >= a1 && n < christmas) {
    season = "avvento";
    week = Math.floor((n - a1) / 7) + 1;
    dayOfSeason = seasonDayName("avvento", week, wd);
    color = isSunday && week === 3 ? "rosaceo" : "viola";
    songSeason = "avvento";
    privileged = isSunday;
  } else if (n >= christmas || n <= bapt) {
    season = "natale";
    songSeason = "natale";
    color = "bianco";
    const jan = n <= bapt;
    if (!jan && n - christmas <= 7) {
      const k = n - christmas;
      dayOfSeason = k === 0 ? "Natale del Signore" : `${roman(k + 1)} giorno fra l'ottava di Natale`;
      if (k === 0) rank = "solennità";
    } else if (jan && n === bapt) {
      dayOfSeason = "Battesimo del Signore";
    } else if (jan && n === dn(y, 1, 1)) {
      dayOfSeason = "Ottava di Natale";
    } else if (jan && n < dn(y, 1, 6)) {
      dayOfSeason = isSunday ? "II domenica dopo Natale" : `${WEEKDAYS[wd]} del Tempo di Natale`;
    } else {
      dayOfSeason = `${WEEKDAYS[wd]} del Tempo di Natale dopo l'Epifania`;
    }
  } else if (n >= ash && n < e - 3) {
    season = "quaresima";
    songSeason = "quaresima";
    color = "viola";
    if (n < lent1) {
      week = null;
      dayOfSeason = n === ash ? "Mercoledì delle Ceneri" : `${WEEKDAYS[wd]} dopo le Ceneri`;
      privileged = n === ash;
    } else if (n >= palm) {
      week = 6;
      dayOfSeason = n === palm ? "Domenica delle Palme e della Passione del Signore" : `${WEEKDAYS[wd]} santo`;
      color = n === palm ? "rosso" : "viola";
      privileged = true;
    } else {
      week = Math.floor((n - lent1) / 7) + 1;
      dayOfSeason = seasonDayName("quaresima", week, wd);
      if (isSunday && week === 4) color = "rosaceo";
      privileged = isSunday;
    }
  } else if (n >= e - 3 && n < e) {
    season = "triduo";
    songSeason = "quaresima";
    privileged = true;
    if (n === e - 3) {
      dayOfSeason = "Giovedì santo — Messa nella Cena del Signore";
      color = "bianco";
    } else if (n === e - 2) {
      dayOfSeason = "Venerdì santo — Passione del Signore";
      color = "rosso";
    } else {
      dayOfSeason = "Sabato santo — Veglia pasquale nella notte";
      color = "viola";
    }
  } else if (n >= e && n <= pentecost) {
    season = "pasqua";
    songSeason = "pasqua";
    color = "bianco";
    week = Math.floor((n - e) / 7) + 1;
    if (n === e) dayOfSeason = "Domenica di Pasqua — Risurrezione del Signore";
    else if (n < e + 7) dayOfSeason = `${WEEKDAYS[wd]} fra l'ottava di Pasqua`;
    else if (n === e + 7) dayOfSeason = "II domenica di Pasqua (della Divina Misericordia)";
    else if (n === e + 42) dayOfSeason = "Ascensione del Signore";
    else if (n === pentecost) dayOfSeason = "Domenica di Pentecoste";
    else dayOfSeason = seasonDayName("pasqua", week, wd);
    if (n === pentecost) {
      color = "rosso";
      songSeason = "spirito-santo";
    }
    if (n === e + 42 || n === pentecost || n === e) rank = "solennità";
    privileged = isSunday || n < e + 7;
  } else {
    season = "ordinario";
    songSeason = "ordinario";
    color = "verde";
    week = n < ash ? Math.floor((n - bapt) / 7) + 1 : 34 - Math.floor((a1 - 1 - n) / 7);
    dayOfSeason = seasonDayName("ordinario", week, wd);
  }

  // ── celebrazioni ──
  let title = dayOfSeason;
  const movable = new Map<DayNum, Celebration>([
    [holyFamily(y), { name: "Santa Famiglia di Gesù, Maria e Giuseppe", rank: "festa", color: "bianco", lord: true }],
    [bapt, { name: "Battesimo del Signore", rank: "festa", color: "bianco", lord: true }],
    [pentecost + 1, { name: "Beata Vergine Maria Madre della Chiesa", rank: "memoria", color: "bianco", songSeason: "maria" }],
    [pentecost + 4, { name: "Nostro Signore Gesù Cristo Sommo ed Eterno Sacerdote", rank: "festa", color: "bianco", lord: true }],
    [e + 56, { name: "Santissima Trinità", rank: "solennità", color: "bianco" }],
    [e + 63, { name: "Santissimo Corpo e Sangue di Cristo (Corpus Domini)", rank: "solennità", color: "bianco" }],
    [e + 68, { name: "Sacratissimo Cuore di Gesù", rank: "solennità", color: "bianco" }],
    [a1 - 7, { name: "Nostro Signore Gesù Cristo Re dell'universo", rank: "solennità", color: "bianco" }],
  ]);
  const fixedKey = fixedForYear(y).get(n);
  const cel = movable.get(n) ?? (fixedKey ? FIXED[fixedKey] : undefined);
  if (cel && !privileged) {
    let applies = isSunday
      ? cel.rank === "solennità" || (cel.rank === "festa" && cel.lord) || fixedKey === "11-02"
      : true;
    // le memorie cedono nelle ferie di Quaresima e dal 17 al 24 dicembre
    if (cel.rank === "memoria" && (season === "quaresima" || (season === "avvento" && n >= christmas - 8))) {
      applies = false;
    }
    if (applies) {
      title = cel.name;
      rank = cel.rank;
      color = cel.color;
      if (cel.songSeason) songSeason = cel.songSeason;
    }
  }

  // ── settimana del salterio (Liturgia delle Ore) ──
  let psalterWeek: number | null = null;
  if (season === "quaresima" && week === null) psalterWeek = 4;
  else if (week !== null && season !== "natale") psalterWeek = ((week - 1) % 4) + 1;

  return {
    date: iso,
    weekday: WEEKDAYS[wd],
    psalterWeek,
    isSunday,
    season,
    seasonLabel: SEASON_LABELS[season],
    week,
    title,
    dayOfSeason,
    rank,
    color,
    liturgicalYear,
    sundayCycle,
    weekdayCycle,
    songSeason,
  };
}

/** Categoria dei canti suggerita per la data (YYYY-MM-DD), o null se non valida. */
export function seasonForDate(iso: string): Season | null {
  return isValidLiturgicalDate(iso) ? liturgicalDay(iso).songSeason : null;
}

export const COLOR_LABELS: Record<LiturgicalColor, string> = {
  verde: "Verde",
  viola: "Viola",
  bianco: "Bianco",
  rosso: "Rosso",
  rosaceo: "Rosaceo",
  nero: "Nero",
};

export type ReadingsLink = { label: string; href: string };

/**
 * Link alle letture sulla fonte ufficiale CEI (chiesacattolica.it) e, come riserva,
 * su lachiesa.it. Il testo resta sulla fonte: qui non viene copiato né incorporato.
 * La CEI pubblica circa 6 settimane in anticipo: oltre, la riserva diventa il link principale.
 */
export function readingsLinks(iso: string, today: string): { primary: ReadingsLink; secondary: ReadingsLink } {
  const compact = iso.replace(/-/g, "");
  const cei: ReadingsLink = {
    label: "chiesacattolica.it (CEI)",
    href: `https://www.chiesacattolica.it/liturgia-del-giorno/?data-liturgia=${compact}`,
  };
  const alt: ReadingsLink = {
    label: "lachiesa.it",
    href: `https://www.lachiesa.it/calendario/${compact}.html`,
  };
  const a = parseIso(iso);
  const t = parseIso(today);
  const beyondHorizon = a !== null && t !== null && a - t > 42;
  return beyondHorizon ? { primary: alt, secondary: cei } : { primary: cei, secondary: alt };
}
