"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isOwner, requireMember } from "@/auth";
import { db } from "@/db";
import { favoriteSongs, songs } from "@/db/schema";

export type FavoriteResult = { favorite: boolean } | { error: string };

const inputSchema = z.object({
  songId: z.number().int().positive(),
  favorite: z.boolean(),
});

/** Imposta il canto come preferito (o no) per l'utente della sessione. */
export async function setFavorite(songId: number, favorite: boolean): Promise<FavoriteResult> {
  let userId: number;
  let staff = false;
  try {
    const user = await requireMember();
    userId = Number(user.id);
    staff = isOwner(user.role);
  } catch {
    return { error: "Accedi per salvare i preferiti" };
  }
  const parsed = inputSchema.safeParse({ songId, favorite });
  if (!parsed.success || !Number.isInteger(userId) || userId <= 0) return { error: "Richiesta non valida" };

  const song = await db.query.songs.findFirst({
    where: eq(songs.id, parsed.data.songId),
    columns: { id: true, published: true },
  });
  // le bozze esistono solo per lo staff
  if (!song || (!song.published && !staff)) return { error: "Canto non trovato" };

  if (parsed.data.favorite) {
    await db.insert(favoriteSongs).values({ userId, songId: song.id }).onConflictDoNothing();
  } else {
    await db
      .delete(favoriteSongs)
      .where(and(eq(favoriteSongs.userId, userId), eq(favoriteSongs.songId, song.id)));
  }
  revalidatePath("/lodate/area");
  return { favorite: parsed.data.favorite };
}
