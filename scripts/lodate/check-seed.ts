/**
 * Valida scripts/lodate/canti-seed.ts e scripts/lodate/canti-pdf.ts senza
 * toccare il database.
 *
 * Uso: npx tsx scripts/lodate/check-seed.ts
 */
import { chordFromItalian } from "../../src/lib/lodate/chordpro";
import { pdfSongs } from "./canti-pdf";
import { seedSongs, type SeedSong } from "./canti-seed";

const MOMENTS = ["iniziale", "gloria", "offertorio", "santo", "pace", "agnello", "comunione", "finale"];
const SEASONS = [
  "avvento", "natale", "ordinario", "quaresima", "pasqua",
  "spirito-santo", "maria", "perdono", "funerali", "matrimoni",
];
const CHORD_RE = /^[A-G](#|b)?[^/\]]*(\/[A-G](#|b)?)?$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DIRECTIVE_RE = /^\{(soc|eoc|c:\s*[^}]+|lang:\s*[^}]+)\}$/;

const errors: string[] = [];
const err = (slug: string, msg: string) => errors.push(`[${slug}] ${msg}`);
/** Accordo valido in notazione anglosassone o italiana ("La-", "Sol4", "Re/Fa#", "Sib"). */
const validChord = (c: string) => CHORD_RE.test(chordFromItalian(c));

const lists: [string, SeedSong[]][] = [["seedSongs", seedSongs], ["pdfSongs", pdfSongs]];
const allSongs: SeedSong[] = lists.flatMap(([, l]) => l);

for (const [listName, list] of lists) {
const slugs = new Set<string>();
// I canti di pubblico dominio hanno sempre nota sui diritti e classificazione; quelli
// del canzoniere della parrocchia possono non averle (acclamazioni, Alleluja, ecc.).
const strict = listName === "seedSongs";
for (const s of list) {
  const id = `${listName}:${s.slug || "(senza slug)"}`;
  if (!SLUG_RE.test(s.slug)) err(id, "slug non valido");
  if (slugs.has(s.slug)) err(id, "slug duplicato");
  slugs.add(s.slug);
  if (!s.title?.trim()) err(id, "titolo mancante");
  if (strict && !s.copyrightNote?.trim()) err(id, "copyrightNote mancante");
  if (!s.body?.trim()) err(id, "body vuoto");
  if (strict && s.moments.length === 0) err(id, "nessun momento");
  if (strict && s.seasons.length === 0) err(id, "nessun tempo");
  for (const m of s.moments) if (!MOMENTS.includes(m)) err(id, `momento non valido: ${m}`);
  for (const t of s.seasons) if (!SEASONS.includes(t)) err(id, `tempo non valido: ${t}`);
  if (new Set(s.moments).size !== s.moments.length) err(id, "momenti duplicati");
  if (new Set(s.seasons).size !== s.seasons.length) err(id, "tempi duplicati");
  if (s.musicalKey && !validChord(s.musicalKey)) err(id, `tonalità non valida: ${s.musicalKey}`);
  if (s.capo !== undefined && !(Number.isInteger(s.capo) && s.capo >= 1 && s.capo <= 5))
    err(id, `capo non valido: ${s.capo} (intero 1-5)`);
  if (/<[a-z/]/i.test(s.body)) err(id, "contiene HTML");

  let inChorus = false;
  let hasChords = false;
  s.body.split("\n").forEach((line, i) => {
    const n = i + 1;
    const trimmed = line.trim();
    // Direttive
    if (trimmed.startsWith("{")) {
      if (!DIRECTIVE_RE.test(trimmed)) err(id, `riga ${n}: direttiva non valida "${trimmed}"`);
      if (trimmed === "{soc}") {
        if (inChorus) err(id, `riga ${n}: {soc} annidato`);
        inChorus = true;
      } else if (trimmed === "{eoc}") {
        if (!inChorus) err(id, `riga ${n}: {eoc} senza {soc}`);
        inChorus = false;
      }
      return;
    }
    if (/[{}]/.test(line)) err(id, `riga ${n}: graffe fuori da una direttiva`);
    // Quadre bilanciate e non annidate
    let depth = 0;
    for (const ch of line) {
      if (ch === "[") depth++;
      if (ch === "]") depth--;
      if (depth < 0 || depth > 1) {
        err(id, `riga ${n}: quadre sbilanciate o annidate`);
        break;
      }
    }
    if (depth !== 0) err(id, `riga ${n}: quadre non chiuse`);
    for (const m of line.matchAll(/\[([^\]]*)\]/g)) {
      hasChords = true;
      if (!validChord(m[1])) err(id, `riga ${n}: accordo non riconosciuto "${m[1]}"`);
    }
  });
  if (inChorus) err(id, "{soc} senza {eoc}");
  if (hasChords && !s.musicalKey) err(id, "ha accordi ma manca musicalKey");
}
}

// Ogni momento deve avere almeno un canto
const byMoment = Object.fromEntries(MOMENTS.map((m) => [m, 0]));
const bySeason = Object.fromEntries(SEASONS.map((t) => [t, 0]));
for (const s of allSongs) {
  s.moments.forEach((m) => m in byMoment && byMoment[m]++);
  s.seasons.forEach((t) => t in bySeason && bySeason[t]++);
}
for (const [m, c] of Object.entries(byMoment)) if (c === 0) errors.push(`Nessun canto per il momento "${m}"`);

console.log(`Canti: ${allSongs.length} (seedSongs ${seedSongs.length}, pdfSongs ${pdfSongs.length})`);
console.log(`Con Barrè: ${allSongs.filter((s) => s.capo).length}`);
console.log("Per momento:", byMoment);
console.log("Per tempo:", bySeason);
console.log(`Con accordi: ${allSongs.filter((s) => s.body.includes("[")).length}`);

if (errors.length) {
  console.error(`\n${errors.length} errori:\n` + errors.map((e) => " - " + e).join("\n"));
  process.exit(1);
}
console.log("\nOK: seed valido.");
