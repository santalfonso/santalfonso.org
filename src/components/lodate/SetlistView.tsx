import Link from "next/link";
import {
  formatLongDate,
  orderedSections,
  songHref,
  type SetlistData,
  type SetlistSong,
} from "@/lib/lodate/setlist";

type Props = {
  data: SetlistData;
  songs: Map<number, SetlistSong>;
  /** Percorso di questa pagina, per il "torna alla scaletta" dal canto. */
  selfPath: string;
};

/** Elenco della scaletta nell'ordine fisso, con il momento speciale al suo posto. */
export default function SetlistView({ data, songs, selfPath }: Props) {
  const sections = orderedSections(data);
  const date = formatLongDate(data.date);
  const title = data.title || data.feast || "Scaletta";
  const feast = data.feast && data.feast !== title ? data.feast : null;

  return (
    <article className="ls-card ls-stack" aria-labelledby="ls-setlist-title">
      <header>
        <span className="ls-kicker">Scaletta</span>
        <h2 id="ls-setlist-title" className="ls-title">{title}</h2>
        {(date || feast) && (
          <p className="ls-meta">
            {date && <span>{date}</span>}
            {feast && <span>{feast}</span>}
          </p>
        )}
      </header>

      {data.notes && <p className="ls-note" style={{ whiteSpace: "pre-line" }}>{data.notes}</p>}

      {sections.length === 0 ? (
        <p className="ls-muted">Questa scaletta non contiene ancora canti.</p>
      ) : (
        <ol className="ls-sheet">
          {sections.map((section) => (
            <li key={section.key}>
              <h2 className="ls-sheet-moment">{section.label}</h2>
              <ul className="ls-sheet-songs">
                {section.songIds.map((id) => {
                  const song = songs.get(id);
                  if (!song) return null;
                  return (
                    <li key={id}>
                      <Link className="ls-song-link" href={songHref(song.slug, selfPath)}>
                        <span>
                          <span className="ls-song-title">{song.title}</span>
                          {song.author && <span className="ls-song-sub">{song.author}</span>}
                        </span>
                        {song.musicalKey && (
                          <span className="ls-badge" aria-label={`Tonalità ${song.musicalKey}`}>
                            {song.musicalKey}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}
