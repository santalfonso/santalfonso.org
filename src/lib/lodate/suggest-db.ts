import { eq } from "drizzle-orm";
import { db } from "@/db";
import { songMoments, songSeasons, songs } from "@/db/schema";
import { groqChat } from "@/lib/groq";
import { MOMENTS, isMoment, seasonLabel, type Moment } from "@/lib/lodate/constants";
import { getDailyReadings } from "@/lib/lodate/evangelizo";
import { liturgicalDay } from "@/lib/lodate/liturgia";
import { pickCandidates, type SuggestSong } from "@/lib/lodate/suggest";

/**
 * Suggerimenti dei canti per le letture di una data (letture, repertorio e Groq).
 * Solo lato server: chi la chiama controlla prima l'utente.
 */
export type SongSuggestion = { moment: Moment; songs: { id: number; reason: string }[] };
export type SuggestResult = { theme: string; suggestions: SongSuggestion[] } | { error: string };

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export async function buildSuggestions(date: string): Promise<SuggestResult> {
  const readings = await getDailyReadings(date);
  if (!readings) {
    return { error: "Le letture di questa data non sono ancora disponibili: riprova più avanti." };
  }
  const day = liturgicalDay(date);

  const [rows, moments, seasons] = await Promise.all([
    db
      .select({ id: songs.id, title: songs.title, body: songs.body })
      .from(songs)
      .where(eq(songs.published, true)),
    db.select().from(songMoments),
    db.select().from(songSeasons),
  ]);
  const byId = new Map<number, SuggestSong>(rows.map((r) => [r.id, { ...r, moments: [], seasons: [] }]));
  for (const m of moments) byId.get(m.songId)?.moments.push(m.moment);
  for (const s of seasons) byId.get(s.songId)?.seasons.push(s.season);

  const readingsText = readings.readings.map((r) => `${r.chorus ?? ""} ${r.text}`).join("\n");
  const candidates = pickCandidates([...byId.values()], readingsText, day.songSeason);
  if (candidates.length === 0) return { error: "Non ci sono canti pubblicati da suggerire." };

  const readingsBlock = readings.readings
    .map((r) => {
      const max = r.label === "Vangelo" ? 1600 : 700;
      return `### ${r.label} — ${r.title}\n${r.chorus ? `${r.chorus}\n` : ""}${clip(r.text, max)}`;
    })
    .join("\n\n");
  const songsBlock = candidates
    .map((c) => {
      const labels = [...c.moments, ...c.seasons.map(seasonLabel)].join(", ");
      return `${c.id} | ${c.title}${labels ? ` [${labels}]` : ""} | ${c.excerpt}`;
    })
    .join("\n");
  const momentsList = MOMENTS.map((m) => `${m.slug} (${m.label})`).join(", ");

  const system =
    "Sei un animatore liturgico di una parrocchia cattolica italiana. " +
    "Scegli i canti per la Messa in base alle letture del giorno, usando SOLO i canti dell'elenco fornito " +
    "(identificati dal numero iniziale). Valuta soprattutto il contenuto dei testi in relazione alle letture, " +
    "poi le etichette di momento e tempo liturgico. Per Gloria, Santo e Agnello di Dio scegli canti con quel testo. " +
    "Per ogni momento proponi da 1 a 2 canti, senza ripetere lo stesso canto in momenti diversi. " +
    "Il motivo deve essere una frase breve in italiano che colleghi il canto alle letture o al momento. " +
    'Rispondi solo con JSON: {"tema": "sintesi delle letture in una frase", "suggerimenti": ' +
    '[{"momento": "slug", "canti": [{"id": 123, "motivo": "..."}]}]}. ' +
    `Momenti (slug): ${momentsList}.`;
  const user =
    `Celebrazione: ${day.title} (${day.seasonLabel}, colore ${day.color})\n\n` +
    `LETTURE\n${readingsBlock}\n\n` +
    `CANTI DEL REPERTORIO (id | titolo [etichette] | inizio del testo)\n${songsBlock}`;

  const result = await groqChat({ system, user, json: true, temperature: 0.4, maxTokens: 1200 });
  if ("error" in result) {
    console.error("Suggerimenti canti:", result.error.slice(0, 500));
    // il piano gratuito di Groq ammette poche richieste al minuto
    if (result.error.includes(" 429")) {
      return { error: "Il servizio di intelligenza artificiale è occupato: riprova tra un minuto." };
    }
    return { error: "Il servizio di intelligenza artificiale non ha risposto: riprova tra poco." };
  }

  let parsed: { tema?: unknown; suggerimenti?: unknown };
  try {
    parsed = JSON.parse(result.data);
  } catch {
    return { error: "La risposta dell'intelligenza artificiale non è valida: riprova." };
  }

  // Solo momenti noti e canti tra i candidati, senza doppioni.
  const allowed = new Set(candidates.map((c) => c.id));
  const used = new Set<number>();
  const byMoment = new Map<Moment, { id: number; reason: string }[]>();
  for (const item of Array.isArray(parsed.suggerimenti) ? parsed.suggerimenti : []) {
    const moment = String(item?.momento ?? "");
    if (!isMoment(moment)) continue;
    for (const s of Array.isArray(item?.canti) ? item.canti : []) {
      const id = Number(s?.id);
      if (!allowed.has(id) || used.has(id)) continue;
      const list = byMoment.get(moment) ?? [];
      if (list.length >= 2) continue;
      used.add(id);
      list.push({ id, reason: clip(String(s?.motivo ?? "").trim(), 220) });
      byMoment.set(moment, list);
    }
  }
  const suggestions = MOMENTS.filter((m) => byMoment.has(m.slug)).map((m) => ({
    moment: m.slug,
    songs: byMoment.get(m.slug)!,
  }));
  if (suggestions.length === 0) {
    return { error: "Non sono riuscito a trovare suggerimenti adatti: riprova." };
  }
  return { theme: clip(String(parsed.tema ?? "").trim(), 300), suggestions };
}
