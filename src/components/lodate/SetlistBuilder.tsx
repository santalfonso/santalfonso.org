"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, useTransition } from "react";
import { saveSetlist } from "@/actions/lodate/setlists";
import {
  EXTRA_MOMENT,
  MOMENTS,
  SEASONS,
  isSeason,
  momentLabel,
  seasonLabel,
  type SetlistMoment,
} from "@/lib/lodate/constants";
import { seasonForDate } from "@/lib/lodate/liturgia";
import {
  EXTRA_AT_START,
  LIMITS,
  countSongs,
  encodeSetlist,
  extraPositionLabel,
  orderedSections,
  setlistUrlPath,
  type ExtraPosition,
  type SetlistData,
  type SetlistSong,
} from "@/lib/lodate/setlist";

type Props = {
  catalog: SetlistSong[];
  initial: SetlistData;
  /** publicId della propria scaletta salvata in modifica, altrimenti null. */
  editPublicId: string | null;
  isLoggedIn: boolean;
  /** Tempo liturgico suggerito (es. calcolato dalla data). */
  initialSeason?: string | null;
};

function fold(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const EXTRA_POSITIONS: ExtraPosition[] = [EXTRA_AT_START, ...MOMENTS.map((m) => m.slug)];

export default function SetlistBuilder({ catalog, initial, editPublicId, isLoggedIn, initialSeason }: Props) {
  const router = useRouter();
  const formId = useId();
  const [data, setData] = useState<SetlistData>(initial);
  const [extraEnabled, setExtraEnabled] = useState(Boolean(initial.extraLabel || initial.items.extra.length));
  const [season, setSeason] = useState<string>(initialSeason && isSeason(initialSeason) ? initialSeason : "");
  const [seasonTouched, setSeasonTouched] = useState(false);
  const [openPicker, setOpenPicker] = useState<SetlistMoment | null>(null);
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [pending, startTransition] = useTransition();

  const songsById = useMemo(() => new Map(catalog.map((s) => [s.id, s])), [catalog]);

  /** Dati effettivi (momento speciale incluso solo se attivo). */
  const effective: SetlistData = useMemo(() => {
    if (!extraEnabled) {
      return { ...data, extraLabel: null, extraAfter: null, items: { ...data.items, extra: [] } };
    }
    return {
      ...data,
      extraLabel: data.extraLabel?.trim() || "Momento speciale",
      extraAfter: data.extraAfter ?? EXTRA_AT_START,
    };
  }, [data, extraEnabled]);

  /** Dati da salvare/condividere: un momento speciale vuoto e senza nome viene scartato. */
  const output: SetlistData = useMemo(
    () =>
      extraEnabled && !data.extraLabel?.trim() && data.items.extra.length === 0
        ? { ...effective, extraLabel: null, extraAfter: null }
        : effective,
    [effective, extraEnabled, data.extraLabel, data.items.extra.length]
  );

  const sections = orderedSections(effective, true);
  const total = countSongs(effective);

  function update<K extends keyof SetlistData>(key: K, value: SetlistData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function setItems(moment: SetlistMoment, fn: (ids: number[]) => number[]) {
    setData((d) => ({ ...d, items: { ...d.items, [moment]: fn(d.items[moment]) } }));
  }

  function addSong(moment: SetlistMoment, id: number) {
    if (data.items[moment].includes(id)) return;
    if (data.items[moment].length >= LIMITS.songsPerMoment || total >= LIMITS.totalSongs) {
      setAnnounce("Hai raggiunto il numero massimo di canti.");
      return;
    }
    setItems(moment, (ids) => [...ids, id]);
    setAnnounce(`Aggiunto: ${songsById.get(id)?.title ?? "canto"}`);
  }

  function move(moment: SetlistMoment, index: number, delta: number) {
    setItems(moment, (ids) => {
      const next = [...ids];
      const j = index + delta;
      if (j < 0 || j >= next.length) return ids;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function remove(moment: SetlistMoment, index: number) {
    const title = songsById.get(data.items[moment][index])?.title;
    setItems(moment, (ids) => ids.filter((_, i) => i !== index));
    setAnnounce(`Rimosso: ${title ?? "canto"}`);
  }

  function makeLink() {
    setError("");
    router.push(setlistUrlPath(output));
  }

  function save() {
    setError("");
    if (!effective.title.trim()) {
      setError("Dai un titolo alla scaletta prima di salvarla.");
      document.getElementById(`${formId}-title`)?.focus();
      return;
    }
    startTransition(async () => {
      const result = await saveSetlist(output, editPublicId);
      if ("error" in result) setError(result.error);
      else router.push(`/lodate/s/${result.publicId}`);
    });
  }

  const loginNext = `/lodate/scaletta?d=${encodeSetlist(output)}`;

  return (
    <div className="ls-stack">
      <section className="ls-card ls-stack" aria-labelledby={`${formId}-info`}>
        <h2 id={`${formId}-info`}>Celebrazione</h2>
        <div className="ls-field">
          <label htmlFor={`${formId}-title`}>Titolo</label>
          <input
            id={`${formId}-title`}
            className="ls-input"
            value={data.title}
            maxLength={LIMITS.title}
            placeholder="Es. Messa delle 11"
            onChange={(e) => update("title", e.target.value)}
          />
        </div>
        <div className="ls-grid2">
          <div className="ls-field">
            <label htmlFor={`${formId}-date`}>Data della celebrazione</label>
            <input
              id={`${formId}-date`}
              type="date"
              className="ls-input"
              value={data.date ?? ""}
              onChange={(e) => {
                const value = e.target.value || null;
                update("date", value);
                const auto = value ? seasonForDate(value) : null;
                if (auto && !seasonTouched) setSeason(auto);
              }}
            />
          </div>
          <div className="ls-field">
            <label htmlFor={`${formId}-feast`}>Festività o ricorrenza</label>
            <input
              id={`${formId}-feast`}
              className="ls-input"
              value={data.feast ?? ""}
              maxLength={LIMITS.feast}
              placeholder="Es. II domenica di Avvento"
              onChange={(e) => update("feast", e.target.value || null)}
            />
          </div>
        </div>
        <div className="ls-field">
          <label htmlFor={`${formId}-season`}>Tempo liturgico (per suggerire i canti)</label>
          <select
            id={`${formId}-season`}
            className="ls-select"
            value={season}
            onChange={(e) => {
              setSeason(e.target.value);
              setSeasonTouched(true);
            }}
          >
            <option value="">Nessuno</option>
            {SEASONS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="ls-field">
          <label htmlFor={`${formId}-notes`}>Note</label>
          <textarea
            id={`${formId}-notes`}
            className="ls-textarea"
            value={data.notes ?? ""}
            maxLength={LIMITS.notes}
            onChange={(e) => update("notes", e.target.value || null)}
          />
        </div>
        <label className="ls-check">
          <input
            type="checkbox"
            checked={extraEnabled}
            onChange={(e) => {
              setExtraEnabled(e.target.checked);
              if (!e.target.checked && openPicker === EXTRA_MOMENT) setOpenPicker(null);
            }}
          />
          Aggiungi un momento speciale
        </label>
        {extraEnabled && (
          <div className="ls-grid2">
            <div className="ls-field">
              <label htmlFor={`${formId}-extra`}>Nome del momento</label>
              <input
                id={`${formId}-extra`}
                className="ls-input"
                value={data.extraLabel ?? ""}
                maxLength={LIMITS.extraLabel}
                placeholder="Es. Ingresso degli sposi"
                onChange={(e) => update("extraLabel", e.target.value)}
              />
            </div>
            <div className="ls-field">
              <label htmlFor={`${formId}-extra-pos`}>Posizione</label>
              <select
                id={`${formId}-extra-pos`}
                className="ls-select"
                value={effective.extraAfter ?? EXTRA_AT_START}
                onChange={(e) => update("extraAfter", e.target.value as ExtraPosition)}
              >
                {EXTRA_POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {extraPositionLabel(p)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </section>

      <p className="ls-sr" role="status" aria-live="polite">
        {announce}
      </p>

      {sections.map((section) => (
        <MomentSection
          key={section.moment}
          moment={section.moment}
          label={section.label}
          ids={section.songIds}
          songsById={songsById}
          catalog={catalog}
          season={season}
          open={openPicker === section.moment}
          onToggle={() => setOpenPicker((o) => (o === section.moment ? null : section.moment))}
          onAdd={(id) => addSong(section.moment, id)}
          onMove={(i, d) => move(section.moment, i, d)}
          onRemove={(i) => remove(section.moment, i)}
        />
      ))}

      {error && (
        <p className="ls-error" role="alert">
          {error}
        </p>
      )}

      <div className="ls-sticky-actions">
        {isLoggedIn && (
          <button type="button" className="ls-btn ls-btn--primary" onClick={save} disabled={pending}>
            {pending ? "Salvataggio…" : editPublicId ? "Salva modifiche" : "Salva"}
          </button>
        )}
        <button
          type="button"
          className={`ls-btn${isLoggedIn ? "" : " ls-btn--primary"}`}
          onClick={makeLink}
          disabled={pending}
        >
          Crea link e QR
        </button>
      </div>
      {!isLoggedIn && (
        <p className="ls-small ls-muted">
          Senza account la scaletta vive solo nel link: conservalo o condividilo.{" "}
          <Link className="ls-link" href={`/accedi?next=${encodeURIComponent(loginNext)}`}>
            Accedi
          </Link>{" "}
          per salvarla nella tua area personale.
        </p>
      )}
    </div>
  );
}

type SectionProps = {
  moment: SetlistMoment;
  label: string;
  ids: number[];
  songsById: Map<number, SetlistSong>;
  catalog: SetlistSong[];
  season: string;
  open: boolean;
  onToggle: () => void;
  onAdd: (id: number) => void;
  onMove: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
};

function MomentSection({
  moment,
  label,
  ids,
  songsById,
  catalog,
  season,
  open,
  onToggle,
  onAdd,
  onMove,
  onRemove,
}: SectionProps) {
  const headingId = useId();
  const pickerId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isExtra = moment === EXTRA_MOMENT;

  return (
    <section className={`ls-section${isExtra ? " ls-section--extra" : ""}`} aria-labelledby={headingId}>
      <div className="ls-section-head">
        <h2 id={headingId}>
          {label}
          {ids.length > 0 && <span className="ls-sr">, {ids.length} {ids.length === 1 ? "canto" : "canti"}</span>}
        </h2>
        <button
          ref={toggleRef}
          type="button"
          className="ls-btn ls-btn--small"
          aria-expanded={open}
          aria-controls={pickerId}
          onClick={onToggle}
        >
          {open ? "Chiudi" : "+ Aggiungi canto"}
        </button>
      </div>

      {ids.length > 0 && (
        <ol className="ls-chosen">
          {ids.map((id, i) => {
            const song = songsById.get(id);
            const title = song?.title ?? "Canto non disponibile";
            return (
              <li key={id}>
                <span className="ls-chosen-title">{title}</span>
                <button
                  type="button"
                  className="ls-btn ls-btn--icon"
                  aria-label={`Sposta su ${title}`}
                  disabled={i === 0}
                  onClick={() => onMove(i, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="ls-btn ls-btn--icon"
                  aria-label={`Sposta giù ${title}`}
                  disabled={i === ids.length - 1}
                  onClick={() => onMove(i, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="ls-btn ls-btn--icon ls-btn--danger"
                  aria-label={`Rimuovi ${title}`}
                  onClick={() => onRemove(i)}
                >
                  ×
                </button>
              </li>
            );
          })}
        </ol>
      )}

      {open && (
        <div id={pickerId} className="ls-picker">
          <SongPicker
            moment={moment}
            label={label}
            catalog={catalog}
            season={season}
            chosen={ids}
            onAdd={onAdd}
            onClose={() => {
              onToggle();
              toggleRef.current?.focus();
            }}
          />
        </div>
      )}
    </section>
  );
}

type PickerProps = {
  moment: SetlistMoment;
  label: string;
  catalog: SetlistSong[];
  season: string;
  chosen: number[];
  onAdd: (id: number) => void;
  onClose: () => void;
};

function SongPicker({ moment, label, catalog, season, chosen, onAdd, onClose }: PickerProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const results = useMemo(() => {
    const q = fold(query.trim());
    const scored = catalog
      .filter((s) => !q || fold(`${s.title} ${s.author ?? ""}`).includes(q))
      .map((s) => {
        const forMoment = moment !== EXTRA_MOMENT && s.moments.includes(moment);
        const forSeason = Boolean(season) && s.seasons.includes(season);
        return { song: s, forMoment, forSeason, score: (forMoment ? 2 : 0) + (forSeason ? 1 : 0) };
      })
      .sort((a, b) => b.score - a.score || a.song.title.localeCompare(b.song.title, "it"));
    if (!q && !showAll) {
      const suggested = scored.filter((r) => r.score > 0);
      return { list: suggested.slice(0, 15), suggestedOnly: true, hasMore: scored.length > suggested.slice(0, 15).length };
    }
    return { list: scored.slice(0, 60), suggestedOnly: false, hasMore: scored.length > 60 };
  }, [catalog, moment, season, query, showAll]);

  return (
    <div
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <label htmlFor={inputId} className="ls-label">
        Cerca un canto per «{label}»
      </label>
      <input
        id={inputId}
        type="search"
        className="ls-input"
        style={{ marginTop: 6 }}
        value={query}
        autoFocus
        autoComplete="off"
        placeholder="Titolo o autore"
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className="ls-small ls-muted" style={{ marginTop: 6 }}>
        {results.suggestedOnly
          ? `Suggeriti per ${moment === EXTRA_MOMENT ? "questo momento" : momentLabel(moment)}${season ? ` e ${seasonLabel(season)}` : ""}. Puoi cercare qualunque canto.`
          : `${results.list.length}${results.hasMore ? "+" : ""} risultati`}
      </p>
      {results.list.length === 0 ? (
        <p className="ls-muted" style={{ marginTop: 8 }}>
          {query ? "Nessun canto trovato." : "Nessun canto suggerito: cerca per titolo o mostra tutti."}
        </p>
      ) : (
        <ul className="ls-results">
          {results.list.map(({ song, forMoment, forSeason }) => {
            const already = chosen.includes(song.id);
            return (
              <li key={song.id}>
                <button
                  type="button"
                  className="ls-result"
                  disabled={already}
                  aria-label={`${already ? "Già inserito: " : "Aggiungi "}${song.title}`}
                  onClick={() => onAdd(song.id)}
                >
                  <span>
                    {song.title}
                    {song.author && <span className="ls-song-sub">{song.author}</span>}
                  </span>
                  <span className="ls-row" style={{ gap: 4, flexWrap: "nowrap" }}>
                    {already && <span className="ls-badge">inserito</span>}
                    {!already && forMoment && <span className="ls-badge">consigliato</span>}
                    {!already && forSeason && <span className="ls-badge ls-badge--gold">{seasonLabel(season)}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <div className="ls-row" style={{ marginTop: 10 }}>
        {results.suggestedOnly && results.hasMore && (
          <button type="button" className="ls-btn ls-btn--small" onClick={() => setShowAll(true)}>
            Mostra tutti i canti
          </button>
        )}
        <button type="button" className="ls-btn ls-btn--small" onClick={onClose}>
          Fatto
        </button>
      </div>
    </div>
  );
}
