"use server";

import { and, eq } from "drizzle-orm";
import { isOwner, requireMember } from "@/auth";
import { db } from "@/db";
import { songAnnotations, songs } from "@/db/schema";
import { annotationsSchema, normalizeAnnotations } from "@/lib/lodate/annotations";

export type SaveAnnotationsResult = { ok: true; count: number } | { error: string };

/** Salva tutte le annotazioni dell'utente della sessione per un canto. */
export async function saveAnnotations(songId: number, data: unknown): Promise<SaveAnnotationsResult> {
  let userId: number;
  let staff = false;
  try {
    const user = await requireMember();
    userId = Number(user.id);
    staff = isOwner(user.role);
  } catch {
    return { error: "Accedi per salvare le annotazioni" };
  }
  if (!Number.isInteger(userId) || userId <= 0) return { error: "Sessione non valida" };
  if (!Number.isInteger(songId) || songId <= 0) return { error: "Canto non valido" };

  const parsed = annotationsSchema.safeParse(data);
  if (!parsed.success) return { error: "Annotazioni non valide" };
  const list = normalizeAnnotations(parsed.data);

  const song = await db.query.songs.findFirst({ where: eq(songs.id, songId), columns: { id: true, published: true } });
  // le bozze esistono solo per lo staff
  if (!song || (!song.published && !staff)) return { error: "Canto non trovato" };

  // Sempre filtrato per l'utente della sessione: nessuno può scrivere le annotazioni altrui.
  const where = and(eq(songAnnotations.userId, userId), eq(songAnnotations.songId, songId));
  if (list.length === 0) {
    await db.delete(songAnnotations).where(where);
  } else {
    const json = JSON.stringify(list);
    const updatedAt = new Date().toISOString();
    await db
      .insert(songAnnotations)
      .values({ userId, songId, data: json, updatedAt })
      .onConflictDoUpdate({
        target: [songAnnotations.userId, songAnnotations.songId],
        set: { data: json, updatedAt },
      });
  }
  return { ok: true, count: list.length };
}
