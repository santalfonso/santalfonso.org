import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { setlistItems, setlists, songMoments, songSeasons, songs } from "@/db/schema";
import {
  allSongIds,
  filterKnownSongs,
  setlistFromRows,
  type SetlistData,
  type SetlistSong,
} from "./setlist";

export type { SetlistSong };

/** Catalogo dei canti pubblicati, per il selettore del builder. */
export async function loadSongCatalog(): Promise<SetlistSong[]> {
  const [rows, moments, seasons] = await Promise.all([
    db
      .select({
        id: songs.id,
        slug: songs.slug,
        title: songs.title,
        author: songs.author,
        musicalKey: songs.musicalKey,
      })
      .from(songs)
      .where(eq(songs.published, true))
      .orderBy(asc(songs.title)),
    db.select().from(songMoments),
    db.select().from(songSeasons),
  ]);
  const byId = new Map<number, SetlistSong>(
    rows.map((r) => [r.id, { ...r, moments: [], seasons: [] }])
  );
  for (const m of moments) byId.get(m.songId)?.moments.push(m.moment);
  for (const s of seasons) byId.get(s.songId)?.seasons.push(s.season);
  return [...byId.values()];
}

/** Canti pubblicati con gli id indicati. */
export async function loadSongsByIds(ids: number[]): Promise<Map<number, SetlistSong>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({
      id: songs.id,
      slug: songs.slug,
      title: songs.title,
      author: songs.author,
      musicalKey: songs.musicalKey,
    })
    .from(songs)
    .where(and(inArray(songs.id, ids), eq(songs.published, true)));
  return new Map(rows.map((r) => [r.id, { ...r, moments: [], seasons: [] }]));
}

/** Scaletta + canti esistenti (gli id inesistenti vengono ignorati). */
export async function resolveSetlist(
  data: SetlistData
): Promise<{ data: SetlistData; songs: Map<number, SetlistSong> }> {
  const found = await loadSongsByIds(allSongIds(data));
  return { data: filterKnownSongs(data, new Set(found.keys())), songs: found };
}

export type SavedSetlist = {
  id: number;
  publicId: string;
  ownerId: number;
  data: SetlistData;
};

export async function loadSavedSetlist(publicId: string): Promise<SavedSetlist | null> {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(publicId)) return null;
  const row = await db.query.setlists.findFirst({ where: eq(setlists.publicId, publicId) });
  if (!row) return null;
  const items = await db
    .select({ moment: setlistItems.moment, songId: setlistItems.songId, position: setlistItems.position })
    .from(setlistItems)
    .where(eq(setlistItems.setlistId, row.id));
  return {
    id: row.id,
    publicId: row.publicId,
    ownerId: row.ownerId,
    data: setlistFromRows(row, items),
  };
}
