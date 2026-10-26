import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateSong } from "@/actions/lodate/songs";
import SongForm from "@/components/admin/SongForm";
import { db } from "@/db";
import { songMoments, songSeasons, songs } from "@/db/schema";
import { requireStaffPage } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ModificaCantoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaffPage();
  const { id } = await params;
  const songId = Number(id);
  if (!Number.isInteger(songId) || songId <= 0) notFound();

  const [song, moments, seasons] = await Promise.all([
    db.query.songs.findFirst({ where: eq(songs.id, songId) }),
    db.select({ v: songMoments.moment }).from(songMoments).where(eq(songMoments.songId, songId)),
    db.select({ v: songSeasons.season }).from(songSeasons).where(eq(songSeasons.songId, songId)),
  ]);
  if (!song) notFound();

  return (
    <>
      <Link href="/admin/canti" className="admin-back">← Canti</Link>
      <div className="admin-page-head">
        <h1>Modifica canto</h1>
        <Link href={`/lodate/canti/${song.slug}`} className="admin-btn admin-btn-ghost" target="_blank">
          Apri nel lettore ↗
        </Link>
      </div>
      <SongForm
        action={updateSong.bind(null, songId)}
        song={song}
        moments={moments.map((m) => m.v)}
        seasons={seasons.map((s) => s.v)}
      />
    </>
  );
}
