import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { songMoments, songSeasons, songs } from "@/db/schema";
import { firstLyric, normalizeSearch, plainText } from "@/lib/lodate/chordpro";
import {
  isMoment,
  isSeason,
  MOMENT_SLUGS,
  momentLabel,
  SEASON_SLUGS,
  seasonLabel,
} from "@/lib/lodate/constants";
import CatalogFilters from "@/components/lodate/CatalogFilters";
import ReadingsCard from "@/components/lodate/ReadingsCard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

/** Estratto attorno alla prima occorrenza della ricerca nel testo. */
function snippet(text: string, normQuery: string): string | null {
  const lines = text.split("\n").filter((l) => l.trim());
  const firstWord = normQuery.split(" ")[0];
  const hit = lines.find((l) => normalizeSearch(l).includes(firstWord));
  return hit ?? null;
}

export default async function LodateHome({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q).trim().slice(0, 100);
  const momentoRaw = first(sp.momento);
  const tempoRaw = first(sp.tempo);
  const momento = isMoment(momentoRaw) ? momentoRaw : "";
  const tempo = isSeason(tempoRaw) ? tempoRaw : "";

  const [list, momentRows, seasonRows] = await Promise.all([
    db.query.songs.findMany({
      where: eq(songs.published, true),
      columns: { id: true, slug: true, title: true, author: true, body: true },
    }),
    db.select().from(songMoments),
    db.select().from(songSeasons),
  ]);

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
      <ReadingsCard />

      <section className="lodate-catalog" aria-labelledby="lodate-catalog-title">
        <div className="lodate-catalog__head">
          <h1 id="lodate-catalog-title" className="lodate-h1">
            Canti
          </h1>
          <p className="lodate-catalog__intro">
            Testi e accordi per i cantori e i cori della Messa. Cerca per titolo o per parole del testo,
            oppure filtra per momento della celebrazione e tempo liturgico.
          </p>
        </div>

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
            {results.map((s) => {
              const excerpt = (!s.titleHit && tokens.length > 0 && snippet(s.text, normQuery)) || firstLyric(s.body);
              return (
                <li key={s.id}>
                  <Link href={`/lodate/canti/${s.slug}`} className="lodate-songcard">
                    <span className="lodate-songcard__title">{s.title}</span>
                    {s.author && <span className="lodate-songcard__author">{s.author}</span>}
                    {excerpt && excerpt !== s.title && (
                      <span className="lodate-songcard__excerpt">{excerpt}</span>
                    )}
                    {(s.moments.length > 0 || s.seasons.length > 0) && (
                      <span className="lodate-badges">
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
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
