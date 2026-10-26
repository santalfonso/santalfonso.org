import Link from "next/link";
import { db } from "@/db";
import { songMoments, songSeasons } from "@/db/schema";
import { deleteSong } from "@/actions/lodate/songs";
import DeleteButton from "@/components/admin/DeleteButton";
import { normalizeSearch } from "@/lib/lodate/chordpro";
import {
  isMoment,
  isSeason,
  MOMENT_SLUGS,
  MOMENTS,
  momentLabel,
  SEASON_SLUGS,
  SEASONS,
  seasonLabel,
} from "@/lib/lodate/constants";
import { formatDate } from "@/lib/utils";
import "@/app/lodate.css";
import { requireStaffPage } from "@/auth";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function AdminCantiPage({ searchParams }: { searchParams: SearchParams }) {
  await requireStaffPage();
  const sp = await searchParams;
  const q = first(sp.q).trim().slice(0, 100);
  const momento = isMoment(first(sp.momento)) ? first(sp.momento) : "";
  const tempo = isSeason(first(sp.tempo)) ? first(sp.tempo) : "";
  const stato = ["pubblicati", "bozze"].includes(first(sp.stato)) ? first(sp.stato) : "";

  const [list, momentRows, seasonRows] = await Promise.all([
    db.query.songs.findMany({
      columns: { id: true, slug: true, title: true, author: true, published: true, updatedAt: true, body: true },
    }),
    db.select().from(songMoments),
    db.select().from(songSeasons),
  ]);

  const nq = normalizeSearch(q);
  const rows = list
    .map((s) => ({
      ...s,
      moments: MOMENT_SLUGS.filter((m) => momentRows.some((r) => r.songId === s.id && r.moment === m)),
      seasons: SEASON_SLUGS.filter((x) => seasonRows.some((r) => r.songId === s.id && r.season === x)),
    }))
    .filter(
      (s) =>
        !nq ||
        normalizeSearch(`${s.title} ${s.author ?? ""} ${s.slug}`).includes(nq) ||
        normalizeSearch(s.body.replace(/\[[^\]]*\]/g, "")).includes(nq)
    )
    .filter((s) => !momento || s.moments.includes(momento as (typeof MOMENT_SLUGS)[number]))
    .filter((s) => !tempo || s.seasons.includes(tempo as (typeof SEASON_SLUGS)[number]))
    .filter((s) => !stato || (stato === "pubblicati" ? s.published : !s.published))
    .sort((a, b) => a.title.localeCompare(b.title, "it", { sensitivity: "base" }));

  const hasFilters = !!(q || momento || tempo || stato);

  return (
    <>
      <div className="admin-page-head">
        <h1>Canti</h1>
        <Link href="/admin/canti/nuovo" className="admin-btn admin-btn-primary">
          + Nuovo canto
        </Link>
      </div>

      <form method="get" className="lodate-admin-filters" role="search">
        <div>
          <label htmlFor="q" className="admin-label">Cerca</label>
          <input id="q" name="q" type="search" defaultValue={q} className="admin-input" placeholder="Titolo, autore o testo" />
        </div>
        <div>
          <label htmlFor="momento" className="admin-label">Momento</label>
          <select id="momento" name="momento" defaultValue={momento} className="admin-input">
            <option value="">Tutti</option>
            {MOMENTS.map((m) => (
              <option key={m.slug} value={m.slug}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tempo" className="admin-label">Tempo</label>
          <select id="tempo" name="tempo" defaultValue={tempo} className="admin-input">
            <option value="">Tutti</option>
            {SEASONS.map((s) => (
              <option key={s.slug} value={s.slug}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="stato" className="admin-label">Stato</label>
          <select id="stato" name="stato" defaultValue={stato} className="admin-input">
            <option value="">Tutti</option>
            <option value="pubblicati">Pubblicati</option>
            <option value="bozze">Bozze</option>
          </select>
        </div>
        <button type="submit" className="admin-btn admin-btn-dark">Filtra</button>
        {hasFilters && (
          <Link href="/admin/canti" className="admin-link" style={{ alignSelf: "center" }}>
            Azzera
          </Link>
        )}
      </form>

      <p className="admin-input-hint" style={{ marginBottom: 12 }}>
        {rows.length} {rows.length === 1 ? "canto" : "canti"}
        {hasFilters ? ` (su ${list.length})` : ""}
      </p>

      <div className="admin-table-wrap lodate-admin-song">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Momenti</th>
              <th>Tempi</th>
              <th>Stato</th>
              <th>Modificato</th>
              <th className="right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-table-empty">
                  {hasFilters
                    ? "Nessun canto corrisponde ai filtri."
                    : "Nessun canto. Creane uno con “Nuovo canto”."}
                </td>
              </tr>
            )}
            {rows.map((s) => (
              <tr key={s.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{s.title}</div>
                  {s.author && <div className="admin-input-hint" style={{ marginTop: 2 }}>{s.author}</div>}
                </td>
                <td className="mute" style={{ fontSize: 13 }}>
                  {s.moments.map(momentLabel).join(", ") || "—"}
                </td>
                <td className="mute" style={{ fontSize: 13 }}>
                  {s.seasons.map(seasonLabel).join(", ") || "—"}
                </td>
                <td>
                  {s.published ? (
                    <span className="admin-badge admin-badge-pub">Pubblicato</span>
                  ) : (
                    <span className="admin-badge admin-badge-draft">Bozza</span>
                  )}
                </td>
                <td className="mute">{formatDate(s.updatedAt)}</td>
                <td className="right">
                  <div className="admin-table-actions">
                    <Link href={`/lodate/canti/${s.slug}`} className="admin-link" target="_blank">
                      Apri
                    </Link>
                    <Link href={`/admin/canti/${s.id}`} className="admin-link">
                      Modifica
                    </Link>
                    <DeleteButton
                      action={deleteSong.bind(null, s.id)}
                      confirmMessage={`Eliminare il canto "${s.title}"? Verrà tolto anche dalle scalette, dai preferiti e dalle annotazioni dei cantori.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
