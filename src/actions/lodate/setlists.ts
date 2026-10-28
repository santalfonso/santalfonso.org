"use server";

import { randomBytes } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireMember } from "@/auth";
import { db } from "@/db";
import { feastForDate } from "@/lib/lodate/liturgia";
import { setlistItems, setlists, songs } from "@/db/schema";
import {
  allSongIds,
  filterKnownSongs,
  normalizeSetlist,
  extrasMetaToColumns,
  rowsFromSetlist,
} from "@/lib/lodate/setlist";

export type SaveSetlistResult = { error: string } | { publicId: string };

function newPublicId() {
  return randomBytes(18).toString("base64url"); // 24 caratteri, 144 bit
}

async function currentUserId(): Promise<number> {
  const user = await requireMember();
  const id = Number(user.id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Non autorizzato");
  return id;
}

/**
 * Crea (publicId assente) o aggiorna (publicId del proprio) una scaletta.
 * L'input viene sempre rinormalizzato lato server.
 */
export async function saveSetlist(input: unknown, publicId?: string | null): Promise<SaveSetlistResult> {
  let userId: number;
  try {
    userId = await currentUserId();
  } catch {
    return { error: "Accedi per salvare la scaletta." };
  }

  const normalized = normalizeSetlist(input);
  // La festività si ricava sempre dalla data; il titolo è facoltativo.
  const feast = normalized.date ? feastForDate(normalized.date) : null;

  const ids = allSongIds(normalized);
  const existing = ids.length
    ? await db
        .select({ id: songs.id })
        .from(songs)
        .where(and(inArray(songs.id, ids), eq(songs.published, true)))
    : [];
  const data = filterKnownSongs(normalized, new Set(existing.map((s) => s.id)));
  const values = {
    title: data.title || feast || "Scaletta",
    celebrationDate: data.date,
    feast,
    notes: data.notes,
    ...extrasMetaToColumns(data.extras),
  };
  const rows = rowsFromSetlist(data);

  if (publicId) {
    if (typeof publicId !== "string") return { error: "Scaletta non trovata." };
    const row = await db.query.setlists.findFirst({
      where: and(eq(setlists.publicId, publicId), eq(setlists.ownerId, userId)),
    });
    if (!row) return { error: "Scaletta non trovata o non tua." };
    await db.transaction(async (tx) => {
      await tx
        .update(setlists)
        .set({ ...values, updatedAt: new Date().toISOString().slice(0, 19).replace("T", " ") })
        .where(and(eq(setlists.id, row.id), eq(setlists.ownerId, userId)));
      await tx.delete(setlistItems).where(eq(setlistItems.setlistId, row.id));
      if (rows.length) {
        await tx.insert(setlistItems).values(rows.map((r) => ({ ...r, setlistId: row.id })));
      }
    });
    revalidatePath(`/lodate/s/${row.publicId}`);
    revalidatePath("/lodate/area");
    return { publicId: row.publicId };
  }

  const newId = newPublicId();
  await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(setlists)
      .values({ ...values, publicId: newId, ownerId: userId })
      .returning({ id: setlists.id });
    if (rows.length) {
      await tx.insert(setlistItems).values(rows.map((r) => ({ ...r, setlistId: created.id })));
    }
  });
  revalidatePath("/lodate/area");
  return { publicId: newId };
}

/** Elimina una propria scaletta (form con campo `publicId`). */
export async function deleteSetlist(formData: FormData): Promise<void> {
  const userId = await currentUserId();
  const publicId = formData.get("publicId");
  if (typeof publicId !== "string" || !publicId) throw new Error("Scaletta non valida");
  const row = await db.query.setlists.findFirst({
    where: and(eq(setlists.publicId, publicId), eq(setlists.ownerId, userId)),
  });
  if (!row) throw new Error("Scaletta non trovata");
  // setlist_items ha ON DELETE CASCADE, ma lo facciamo esplicito per sicurezza
  await db.transaction(async (tx) => {
    await tx.delete(setlistItems).where(eq(setlistItems.setlistId, row.id));
    await tx.delete(setlists).where(and(eq(setlists.id, row.id), eq(setlists.ownerId, userId)));
  });
  revalidatePath("/lodate/area");
  revalidatePath(`/lodate/s/${publicId}`);
  redirect("/lodate/area");
}
