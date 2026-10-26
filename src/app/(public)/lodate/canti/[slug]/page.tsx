import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { and, eq } from "drizzle-orm";
import { auth, isStaff } from "@/auth";
import { db } from "@/db";
import { favoriteSongs, songAnnotations, songMoments, songSeasons, songs } from "@/db/schema";
import { parseStoredAnnotations } from "@/lib/lodate/annotations";
import { firstLyric } from "@/lib/lodate/chordpro";
import { MOMENT_SLUGS, SEASON_SLUGS } from "@/lib/lodate/constants";
import SongViewer from "@/components/lodate/SongViewer";

export const dynamic = "force-dynamic";

const getSong = cache(async (slug: string) =>
  db.query.songs.findFirst({ where: eq(songs.slug, slug) })
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const song = await getSong(slug);
  if (!song || !song.published) return { title: "Canto non trovato" };
  return {
    title: song.title,
    description: [firstLyric(song.body), song.author].filter(Boolean).join(" — ").slice(0, 160),
  };
}

/**
 * Link di ritorno alla scaletta (`?from=`): accettato solo se è un percorso
 * interno di scaletta, senza schema, "//", backslash, ".." o caratteri di controllo.
 */
function safeSetlistReturn(raw: string | string[] | undefined): string | null {
  const from = Array.isArray(raw) ? raw[0] : raw;
  if (!from || from.length > 2000) return null;
  if (!from.startsWith("/")) return null;
  if (from.includes("//") || from.includes("\\") || from.includes("..")) return null;
  if (/[\u0000-\u001f\u007f]/.test(from)) return null;
  if (from.startsWith("/lodate/s/") && from.length > "/lodate/s/".length) return from;
  if (/^\/lodate\/scaletta(?:[/?#]|$)/.test(from)) return from;
  return null;
}

export default async function CantoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const backHref = safeSetlistReturn((await searchParams).from);
  const [song, session] = await Promise.all([getSong(slug), auth()]);
  const staff = isStaff(session?.user?.role);
  if (!song || (!song.published && !staff)) notFound();

  const userId = session?.user?.id ? Number(session.user.id) : null;
  const loggedIn = !!userId && Number.isInteger(userId) && userId > 0;

  const [momentRows, seasonRows, fav, annot] = await Promise.all([
    db.select({ v: songMoments.moment }).from(songMoments).where(eq(songMoments.songId, song.id)),
    db.select({ v: songSeasons.season }).from(songSeasons).where(eq(songSeasons.songId, song.id)),
    loggedIn
      ? db.query.favoriteSongs.findFirst({
          where: and(eq(favoriteSongs.userId, userId!), eq(favoriteSongs.songId, song.id)),
          columns: { songId: true },
        })
      : undefined,
    loggedIn
      ? db.query.songAnnotations.findFirst({
          where: and(eq(songAnnotations.userId, userId!), eq(songAnnotations.songId, song.id)),
          columns: { data: true },
        })
      : undefined,
  ]);

  // Ordine fisso come nelle costanti.
  const moments = MOMENT_SLUGS.filter((m) => momentRows.some((r) => r.v === m));
  const seasons = SEASON_SLUGS.filter((s) => seasonRows.some((r) => r.v === s));

  return (
    <div className="container-narrow lodate-page">
      {backHref && (
        <p className="lodate-back lodate-no-print">
          <Link href={backHref}>← Torna alla scaletta</Link>
        </p>
      )}
      <SongViewer
        song={{
          id: song.id,
          slug: song.slug,
          title: song.title,
          author: song.author,
          copyrightNote: song.copyrightNote,
          musicalKey: song.musicalKey,
          body: song.body,
          published: song.published,
        }}
        moments={moments}
        seasons={seasons}
        loggedIn={loggedIn}
        loginHref={`/accedi?next=${encodeURIComponent(`/lodate/canti/${song.slug}`)}`}
        initialFavorite={!!fav}
        initialAnnotations={loggedIn ? parseStoredAnnotations(annot?.data) : []}
      />
    </div>
  );
}
