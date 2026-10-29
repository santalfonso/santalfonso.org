import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { favoriteSongs, songMoments, songSeasons, songs } from "@/db/schema";
import { normalizeSearch, plainText } from "@/lib/lodate/chordpro";
import {
  isMoment,
  isSeason,
  MOMENT_SLUGS,
  momentLabel,
  SEASON_SLUGS,
  seasonLabel,
} from "@/lib/lodate/constants";
import CatalogFilters from "@/components/lodate/CatalogFilters";
import FavoriteHeart from "@/components/lodate/FavoriteHeart";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

export default async function LodateHome({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q).trim().slice(0, 100);
  const momentoRaw = first(sp.momento);
  const tempoRaw = first(sp.tempo);
  const momento = isMoment(momentoRaw) ? momentoRaw : "";
  const tempo = isSeason(tempoRaw) ? tempoRaw : "";

  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : null;
  const [list, momentRows, seasonRows, favRows] = await Promise.all([
    db.query.songs.findMany({
      where: eq(songs.published, true),
      columns: { id: true, slug: true, title: true, author: true, body: true },
    }),
    db.select().from(songMoments),
    db.select().from(songSeasons),
    userId
      ? db.select({ songId: favoriteSongs.songId }).from(favoriteSongs).where(eq(favoriteSongs.userId, userId))
      : Promise.resolve([]),
  ]);
  const favorites = new Set(favRows.map((r) => r.songId));

  const momentsBySong = new Map<number, string[]>();
  for (const r of momentRows) momentsBySong.set(r.songId, [...(momentsBySong.get(r.songId) ?? []), r.moment]);
  const seasonsBySong = new Map<number, string[]>();
  for (const r of seasonRows) seasonsBySong.set(r.songId, [...(seasonsBySong.get(r.songId) ?? []), r.season]);

  const normQuery = normalizeSearch(q);
  const tokens = normQuery ? normQuery.split(" ") : [];

  const results = list
    .map((s) => {
      const text = plainText(s.body);
      const normTitle = normalizeSearch(s.title);
      const haystack = `${normTitle} ${normalizeSearch(s.author ?? "")} ${normalizeSearch(text)}`;
      return {
        ...s,
        text,
        titleHit: tokens.length > 0 && tokens.every((t) => normTitle.includes(t)),
        match: tokens.every((t) => haystack.includes(t)),
        moments: MOMENT_SLUGS.filter((m) => momentsBySong.get(s.id)?.includes(m)),
        seasons: SEASON_SLUGS.filter((x) => seasonsBySong.get(s.id)?.includes(x)),
      };
    })
    .filter((s) => s.match)
    .filter((s) => !momento || s.moments.includes(momento))
    .filter((s) => !tempo || s.seasons.includes(tempo))
    .sort(
      (a, b) =>
        Number(b.titleHit) - Number(a.titleHit) ||
        a.title.localeCompare(b.title, "it", { sensitivity: "base" })
    );

  const filtersLabel = [momento && momentLabel(momento), tempo && seasonLabel(tempo)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="container lodate-page lodate-home">
      <section className="lodate-catalog" aria-labelledby="lodate-catalog-title">
        <h2 id="lodate-catalog-title" className="lodate-sr">
          Repertorio
        </h2>

        <CatalogFilters q={q} momento={momento} tempo={tempo} />

        <p className="lodate-count" aria-live="polite">
          {results.length === 0
            ? "Nessun canto trovato"
            : `${results.length} ${results.length === 1 ? "canto" : "canti"}`}
          {q ? ` per “${q}”` : ""}
          {filtersLabel ? ` · ${filtersLabel}` : ""}
        </p>

        {results.length === 0 ? (
          <div className="lodate-empty">
            <p>
              Prova con meno parole o togli un filtro.{" "}
              {(q || momento || tempo) && <Link href="/lodate">Mostra tutti i canti</Link>}
            </p>
          </div>
        ) : (
          <ul className="lodate-songlist">
            {results.map((s) => (
              <li key={s.id} className="lodate-songrow">
                <Link href={`/lodate/canti/${s.slug}`} className="lodate-songrow__link">
                  <span className="lodate-songrow__title">{s.title}</span>
                  {s.author && <span className="lodate-songrow__author">{s.author}</span>}
                  {(s.moments.length > 0 || s.seasons.length > 0) && (
                    <span className="lodate-badges lodate-badges--small">
                      {s.moments.map((m) => (
                        <span key={m} className={`lodate-badge lodate-badge--moment${m === momento ? " is-active" : ""}`}>
                          {momentLabel(m)}
                        </span>
                      ))}
                      {s.seasons.map((x) => (
                        <span key={x} className={`lodate-badge lodate-badge--season${x === tempo ? " is-active" : ""}`}>
                          {seasonLabel(x)}
                        </span>
                      ))}
                    </span>
                  )}
                </Link>
                {userId && <FavoriteHeart songId={s.id} title={s.title} initial={favorites.has(s.id)} />}
                <svg className="lodate-songrow__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
