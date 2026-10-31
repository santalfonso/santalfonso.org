"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/auth";
import { db } from "@/db";
import {
  favoriteSongs,
  setlistItems,
  songAnnotations,
  songMoments,
  songSeasons,
  songs,
} from "@/db/schema";
import { isMoment, isSeason } from "@/lib/lodate/constants";
import { parseKey } from "@/lib/lodate/chordpro";
import { slugify } from "@/lib/utils";

export type SongActionState = { error?: string } | undefined;

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Massimo ${max} caratteri`)
    .optional()
    .transform((v) => (v ? v : null));

const songSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200, "Titolo troppo lungo"),
  slug: z
    .string()
    .trim()
    .max(120, "Slug troppo lungo")
    .optional()
    .transform((v) => v ?? ""),
  author: optionalText(200),
  copyrightNote: optionalText(500),
  musicalKey: optionalText(20).refine((v) => v === null || parseKey(v) !== null, {
    message: "Tonalità non riconosciuta (es. Sol, Mim, Fa#m, Sib)",
  }),
  capo: z
    .number()
    .int()
    .min(0, "Barrè non valido")
    .max(5, "Barrè non valido")
    .transform((v) => (v > 0 ? v : null)),
  body: z.string().trim().min(1, "Il testo del canto è obbligatorio").max(50_000, "Testo troppo lungo"),
  published: z.boolean(),
  moments: z.array(z.string().refine(isMoment, "Momento non valido")).max(20),
  seasons: z.array(z.string().refine(isSeason, "Tempo non valido")).max(20),
});

function parseForm(formData: FormData) {
  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" ? v : undefined;
  };
  return songSchema.safeParse({
    title: str("title") ?? "",
    slug: str("slug"),
    author: str("author"),
    copyrightNote: str("copyrightNote"),
    musicalKey: str("musicalKey"),
    capo: Number(str("capo") ?? 0),
    body: (str("body") ?? "").replace(/\r\n?/g, "\n"),
    published: formData.get("published") === "on",
    moments: [...new Set(formData.getAll("moments").filter((v): v is string => typeof v === "string"))],
    seasons: [...new Set(formData.getAll("seasons").filter((v): v is string => typeof v === "string"))],
  });
}

async function resolveSlug(raw: string, title: string, excludeId?: number) {
  const slug = raw ? slugify(raw) : slugify(title);
  if (!slug || !SLUG_RE.test(slug)) return { error: "Slug non valido: usa lettere minuscole, numeri e trattini" };
  const clash = await db.query.songs.findFirst({
    where: excludeId ? and(eq(songs.slug, slug), ne(songs.id, excludeId)) : eq(songs.slug, slug),
    columns: { id: true },
  });
  if (clash) return { error: `Esiste già un canto con lo slug "${slug}"` };
  return { slug };
}

function revalidateSong(slug?: string) {
  revalidatePath("/lodate");
  revalidatePath("/admin/canti");
  if (slug) revalidatePath(`/lodate/canti/${slug}`);
}

export async function createSong(_prev: SongActionState, formData: FormData): Promise<SongActionState> {
  await requireOwner();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { moments, seasons, slug: rawSlug, ...data } = parsed.data;

  const resolved = await resolveSlug(rawSlug, data.title);
  if ("error" in resolved) return { error: resolved.error };

  await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(songs)
      .values({ ...data, slug: resolved.slug })
      .returning({ id: songs.id });
    if (moments.length) await tx.insert(songMoments).values(moments.map((moment) => ({ songId: created.id, moment })));
    if (seasons.length) await tx.insert(songSeasons).values(seasons.map((season) => ({ songId: created.id, season })));
  });

  revalidateSong(resolved.slug);
  redirect("/admin/canti");
}

export async function updateSong(
  id: number,
  _prev: SongActionState,
  formData: FormData
): Promise<SongActionState> {
  await requireOwner();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { moments, seasons, slug: rawSlug, ...data } = parsed.data;

  const current = await db.query.songs.findFirst({ where: eq(songs.id, id), columns: { slug: true } });
  if (!current) return { error: "Canto non trovato" };

  const resolved = await resolveSlug(rawSlug || current.slug, data.title, id);
  if ("error" in resolved) return { error: resolved.error };

  await db.transaction(async (tx) => {
    await tx
      .update(songs)
      .set({ ...data, slug: resolved.slug, updatedAt: new Date().toISOString() })
      .where(eq(songs.id, id));
    await tx.delete(songMoments).where(eq(songMoments.songId, id));
    await tx.delete(songSeasons).where(eq(songSeasons.songId, id));
    if (moments.length) await tx.insert(songMoments).values(moments.map((moment) => ({ songId: id, moment })));
    if (seasons.length) await tx.insert(songSeasons).values(seasons.map((season) => ({ songId: id, season })));
  });

  revalidateSong(current.slug);
  if (resolved.slug !== current.slug) revalidateSong(resolved.slug);
  redirect("/admin/canti");
}

export async function deleteSong(id: number) {
  await requireOwner();
  const current = await db.query.songs.findFirst({ where: eq(songs.id, id), columns: { slug: true } });
  if (!current) return;
  // Le tabelle collegate hanno ON DELETE CASCADE, ma SQLite applica le FK solo
  // se abilitate: cancelliamo esplicitamente tutto ciò che fa riferimento al canto
  // (anche le voci delle scalette, come da schema).
  await db.transaction(async (tx) => {
    await tx.delete(setlistItems).where(eq(setlistItems.songId, id));
    await tx.delete(favoriteSongs).where(eq(favoriteSongs.songId, id));
    await tx.delete(songAnnotations).where(eq(songAnnotations.songId, id));
    await tx.delete(songMoments).where(eq(songMoments.songId, id));
    await tx.delete(songSeasons).where(eq(songSeasons.songId, id));
    await tx.delete(songs).where(eq(songs.id, id));
  });
  revalidateSong(current.slug);
}
