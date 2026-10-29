"use server";

import { requireMember } from "@/auth";
import { isValidLiturgicalDate } from "@/lib/lodate/liturgia";
import { buildSuggestions, type SuggestResult } from "@/lib/lodate/suggest-db";

export type { SongSuggestion } from "@/lib/lodate/suggest-db";

// Poche richieste per utente: ogni richiesta costa una chiamata al modello.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const recent = new Map<string, number[]>();

function rateLimited(userId: string): boolean {
  const now = Date.now();
  const times = (recent.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (times.length >= MAX_PER_WINDOW) return true;
  times.push(now);
  recent.set(userId, times);
  return false;
}

/** Canti del repertorio adatti alle letture del giorno, per ogni momento della Messa. */
export async function suggestSongs(date: string): Promise<SuggestResult> {
  let userId: string;
  try {
    userId = String((await requireMember()).id);
  } catch {
    return { error: "Accedi per usare i suggerimenti." };
  }
  if (typeof date !== "string" || !isValidLiturgicalDate(date)) {
    return { error: "Scegli prima la data della celebrazione." };
  }
  if (rateLimited(userId)) {
    return { error: "Hai chiesto molti suggerimenti di seguito: riprova tra qualche minuto." };
  }

  return buildSuggestions(date);
}
