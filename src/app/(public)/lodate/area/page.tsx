import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { auth } from "@/auth";
import { lodateLogoutAction } from "@/actions/lodate/login";
import { db } from "@/db";
import { favoriteSongs, setlistItems, setlists, songs } from "@/db/schema";
import { encodeSetlist, formatLongDate, todayInRome } from "@/lib/lodate/setlist";
import { loadSavedSetlist } from "@/lib/lodate/setlist-db";
import "@/app/lodate-scalette.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "La mia area",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const MONTHS = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];

function first(v: string | string[] | undefined): string {
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

type Row = {
  publicId: string;
  title: string;
  celebrationDate: string | null;
  feast: string | null;
  songs: number;
};

export default async function AreaPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/lodate/accedi?next=/lodate/area");
  const userId = Number(session.user.id);
  const sp = await searchParams;

  // Duplica: apre il builder precompilato (senza data) senza scrivere nel DB
  const dup = first(sp.duplica);
  if (dup) {
    const saved = await loadSavedSetlist(dup);
    if (saved && saved.ownerId === userId) {
      redirect(`/lodate/scaletta?d=${encodeSetlist({ ...saved.data, date: null })}`);
    }
  }

  const list = await db
    .select({
      id: setlists.id,
      publicId: setlists.publicId,
      title: setlists.title,
      celebrationDate: setlists.celebrationDate,
      feast: setlists.feast,
    })
    .from(setlists)
    .where(eq(setlists.ownerId, userId))
    .orderBy(asc(setlists.celebrationDate), desc(setlists.updatedAt));

  const counts = list.length
    ? await db
        .select({ setlistId: setlistItems.setlistId, n: count() })
        .from(setlistItems)
        .where(inArray(setlistItems.setlistId, list.map((s) => s.id)))
        .groupBy(setlistItems.setlistId)
    : [];
  const countBy = new Map(counts.map((c) => [c.setlistId, c.n]));
  const rows: Row[] = list.map((s) => ({ ...s, songs: countBy.get(s.id) ?? 0 }));

  const favorites = await db
    .select({ slug: songs.slug, title: songs.title, author: songs.author })
    .from(favoriteSongs)
    .innerJoin(songs, eq(favoriteSongs.songId, songs.id))
    .where(and(eq(favoriteSongs.userId, userId), eq(songs.published, true)))
    .orderBy(asc(songs.title));

  const today = todayInRome();
  const upcoming = rows.filter((r) => r.celebrationDate && r.celebrationDate >= today);
  const undated = rows.filter((r) => !r.celebrationDate);
  const pastAll = rows
    .filter((r) => r.celebrationDate && r.celebrationDate < today)
    .sort((a, b) => (b.celebrationDate! < a.celebrationDate! ? -1 : 1));

  // filtri dello storico
  const anno = first(sp.anno);
  const mese = first(sp.mese);
  const festa = first(sp.festa);
  const raggruppa = first(sp.raggruppa) === "festa" ? "festa" : "data";
  const years = [...new Set(pastAll.map((r) => r.celebrationDate!.slice(0, 4)))];
  const feasts = [...new Set(pastAll.map((r) => r.feast).filter((f): f is string => Boolean(f)))].sort((a, b) =>
    a.localeCompare(b, "it")
  );
  const past = pastAll.filter(
    (r) =>
      (!anno || r.celebrationDate!.startsWith(anno)) &&
      (!mese || r.celebrationDate!.slice(5, 7) === mese.padStart(2, "0")) &&
      (!festa || r.feast === festa)
  );
  const groups = new Map<string, Row[]>();
  for (const r of past) {
    const key =
      raggruppa === "festa"
        ? r.feast || "Senza festività"
        : `${MONTHS[Number(r.celebrationDate!.slice(5, 7)) - 1]} ${r.celebrationDate!.slice(0, 4)}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const filtering = Boolean(anno || mese || festa || raggruppa === "festa");

  return (
    <div className="ls ls-stack">
      <header>
        <span className="ls-kicker">Area personale</span>
        <h1>Ciao{session.user.name ? `, ${session.user.name}` : ""}</h1>
        <div className="ls-row" style={{ marginTop: 12 }}>
          <Link className="ls-btn ls-btn--primary" href="/lodate/scaletta">
            + Nuova scaletta
          </Link>
          <form action={lodateLogoutAction}>
            <button type="submit" className="ls-btn">
              Esci
            </button>
          </form>
        </div>
      </header>

      <section className="ls-card" aria-labelledby="ls-upcoming">
        <h2 id="ls-upcoming">Prossime scalette</h2>
        {upcoming.length === 0 && undated.length === 0 ? (
          <p className="ls-muted" style={{ marginTop: 8 }}>
            Nessuna scaletta in programma.
          </p>
        ) : (
          <SetlistRows rows={[...upcoming, ...undated]} />
        )}
      </section>

      <section className="ls-card ls-stack" aria-labelledby="ls-past">
        <h2 id="ls-past">Storico</h2>
        {pastAll.length === 0 ? (
          <p className="ls-muted">Le scalette delle celebrazioni passate compariranno qui.</p>
        ) : (
          <>
            <form method="get" className="ls-filters" aria-label="Filtra lo storico">
              <div className="ls-field">
                <label htmlFor="f-anno">Anno</label>
                <select id="f-anno" name="anno" defaultValue={anno} className="ls-select">
                  <option value="">Tutti</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ls-field">
                <label htmlFor="f-mese">Mese</label>
                <select id="f-mese" name="mese" defaultValue={mese} className="ls-select">
                  <option value="">Tutti</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={String(i + 1).padStart(2, "0")}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ls-field ls-field--wide">
                <label htmlFor="f-festa">Festività</label>
                <select id="f-festa" name="festa" defaultValue={festa} className="ls-select">
                  <option value="">Tutte</option>
                  {feasts.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ls-field">
                <label htmlFor="f-group">Raggruppa per</label>
                <select id="f-group" name="raggruppa" defaultValue={raggruppa} className="ls-select">
                  <option value="data">Mese</option>
                  <option value="festa">Festività</option>
                </select>
              </div>
              <div className="ls-row" style={{ gridColumn: "1 / -1" }}>
                <button type="submit" className="ls-btn">
                  Applica
                </button>
                {filtering && (
                  <Link className="ls-btn" href="/lodate/area">
                    Azzera
                  </Link>
                )}
              </div>
            </form>
            {past.length === 0 ? (
              <p className="ls-muted">Nessuna scaletta corrisponde ai filtri.</p>
            ) : (
              [...groups.entries()].map(([label, items]) => (
                <div key={label}>
                  <h3 className="ls-month">{label}</h3>
                  <SetlistRows rows={items} />
                </div>
              ))
            )}
          </>
        )}
      </section>

      <section className="ls-card" aria-labelledby="ls-fav">
        <h2 id="ls-fav">Canti preferiti</h2>
        {favorites.length === 0 ? (
          <p className="ls-muted" style={{ marginTop: 8 }}>
            Nessun preferito: aprendo un canto puoi aggiungerlo ai preferiti.
          </p>
        ) : (
          <ul className="ls-list">
            {favorites.map((f) => (
              <li key={f.slug}>
                <div className="ls-list-main">
                  <Link className="ls-list-title" href={`/lodate/canti/${encodeURIComponent(f.slug)}`}>
                    {f.title}
                  </Link>
                  {f.author && <span className="ls-song-sub">{f.author}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SetlistRows({ rows }: { rows: Row[] }) {
  return (
    <ul className="ls-list">
      {rows.map((r) => (
        <li key={r.publicId}>
          <div className="ls-list-main">
            <Link className="ls-list-title" href={`/lodate/s/${r.publicId}`}>
              {r.title}
            </Link>
            <span className="ls-song-sub">
              {[formatLongDate(r.celebrationDate) || "Senza data", r.feast, `${r.songs} ${r.songs === 1 ? "canto" : "canti"}`]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </div>
          <div className="ls-row">
            <Link className="ls-btn ls-btn--small" href={`/lodate/scaletta?id=${r.publicId}`}>
              Modifica<span className="ls-sr"> {r.title}</span>
            </Link>
            <Link className="ls-btn ls-btn--small" href={`/lodate/area?duplica=${r.publicId}`}>
              Duplica<span className="ls-sr"> {r.title}</span>
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
