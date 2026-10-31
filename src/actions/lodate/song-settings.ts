"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { isOwner, requireMember } from "@/auth";
import { db } from "@/db";
import { songUserSettings, songs } from "@/db/schema";

export type SongSettingsResult = { ok: true } | { error: string };

const inputSchema = z.object({
  songId: z.number().int().positive(),
  transpose: z.number().int().min(-11).max(11),
  capo: z.number().int().min(0).max(5),
});

/** Salva trasposizione e Barrè scelti dall'utente della sessione per un canto. */
export async function saveSongSettings(songId: number, transpose: number, capo: number): Promise<SongSettingsResult> {
  let userId: number;
  let staff = false;
  try {
    const user = await requireMember();
    userId = Number(user.id);
    staff = isOwner(user.role);
  } catch {
    return { error: "Accedi per salvare le tue impostazioni" };
  }
  const parsed = inputSchema.safeParse({ songId, transpose, capo });
  if (!parsed.success || !Number.isInteger(userId) || userId <= 0) return { error: "Richiesta non valida" };

  const song = await db.query.songs.findFirst({
    where: eq(songs.id, parsed.data.songId),
    columns: { id: true, published: true },
  });
  if (!song || (!song.published && !staff)) return { error: "Canto non trovato" };

  const values = { transpose: parsed.data.transpose, capo: parsed.data.capo };
  await db
    .insert(songUserSettings)
    .values({ userId, songId: song.id, ...values })
    .onConflictDoUpdate({
      target: [songUserSettings.userId, songUserSettings.songId],
      set: { ...values, updatedAt: new Date().toISOString().slice(0, 19).replace("T", " ") },
    });
  return { ok: true };
}
