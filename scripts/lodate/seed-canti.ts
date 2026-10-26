/**
 * Inserisce i canti di pubblico dominio di "Lodate, lodate Iddio".
 * Idempotente: salta i canti il cui slug esiste già, non modifica né cancella nulla.
 *
 * Uso: npx tsx --env-file=.env.local scripts/lodate/seed-canti.ts [--solo-accordi]
 * Con --solo-accordi inserisce solo i canti che hanno accordi.
 */
import { db } from "../../src/db";
import { songMoments, songSeasons, songs } from "../../src/db/schema";
import { isMoment, isSeason } from "../../src/lib/lodate/constants";
import { seedSongs } from "./canti-seed";

async function main() {
  const existing = new Set(
    (await db.select({ slug: songs.slug }).from(songs)).map((s) => s.slug)
  );
  const onlyWithChords = process.argv.includes("--solo-accordi");
  const selected = onlyWithChords
    ? seedSongs.filter((s) => /\[[A-G]/.test(s.body))
    : seedSongs;
  let inserted = 0;

  for (const song of selected) {
    if (existing.has(song.slug)) continue;
    const moments = song.moments.filter(isMoment);
    const seasons = song.seasons.filter(isSeason);

    await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(songs)
        .values({
          slug: song.slug,
          title: song.title,
          author: song.author ?? null,
          copyrightNote: song.copyrightNote,
          musicalKey: song.musicalKey ?? null,
          body: song.body,
          published: true,
        })
        .returning({ id: songs.id });
      if (moments.length) {
        await tx
          .insert(songMoments)
          .values(moments.map((moment) => ({ songId: row.id, moment })));
      }
      if (seasons.length) {
        await tx
          .insert(songSeasons)
          .values(seasons.map((season) => ({ songId: row.id, season })));
      }
    });
    inserted++;
  }

  console.log(
    `Canti inseriti: ${inserted}, già presenti: ${selected.length - inserted}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
