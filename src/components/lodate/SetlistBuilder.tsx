"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import { saveSetlist } from "@/actions/lodate/setlists";
import { isMoment, isSeason, momentLabel, seasonLabel } from "@/lib/lodate/constants";
import { COLOR_LABELS, isValidLiturgicalDate, liturgicalDay } from "@/lib/lodate/liturgia";
import {
  LIMITS,
  countSongs,
  encodeSetlist,
  extraIndex,
  extraKey,
  extraPositionLabel,
  extraSlot,
  orderedSections,
  placeExtra,
  setlistUrlPath,
  type SetlistData,
  type SetlistExtra,
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

let uidCounter = 0;
function newUid() {
  return `x${++uidCounter}`;
}

export default function SetlistBuilder({ catalog, initial, editPublicId, isLoggedIn, initialSeason }: Props) {
  const router = useRouter();
  const formId = useId();
  const [data, setData] = useState<SetlistData>(() => ({
    ...initial,
    extras: initial.extras.map((e) => ({ ...e, uid: newUid() })),
  }));
  // Trascinamento dei momenti speciali: uid della riga trascinata.
  const [dragUid, setDragUid] = useState<string | null>(null);
  const dataRef = useRef(data);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  // Festa e tempo liturgico si ricavano dalla data.
  const day = useMemo(
    () => (data.date && isValidLiturgicalDate(data.date) ? liturgicalDay(data.date) : null),
    [data.date]
  );
  const season: string = day?.songSeason ?? (initialSeason && isSeason(initialSeason) ? initialSeason : "");
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [pending, startTransition] = useTransition();

  const songsById = useMemo(() => new Map(catalog.map((s) => [s.id, s])), [catalog]);

  const output = data;
  const sections = orderedSections(data, true);
  const total = countSongs(data);

  /** Canti di una sezione: momento della Messa oppure momento speciale (`extra:N`). */
  function idsOf(d: SetlistData, key: string): number[] {
    if (isMoment(key)) return d.items[key];
    return d.extras[extraIndex(key) ?? -1]?.songs ?? [];
  }

  function setIds(key: string, fn: (ids: number[]) => number[]) {
    setData((d) => {
      if (isMoment(key)) return { ...d, items: { ...d.items, [key]: fn(d.items[key]) } };
      const i = extraIndex(key);
      if (i === null || !d.extras[i]) return d;
      return { ...d, extras: d.extras.map((e, j) => (j === i ? { ...e, songs: fn(e.songs) } : e)) };
    });
  }

  function addSong(key: string, id: number) {
    const ids = idsOf(data, key);
    if (ids.includes(id)) return;
    if (ids.length >= LIMITS.songsPerMoment || total >= LIMITS.totalSongs) {
      setAnnounce("Hai raggiunto il numero massimo di canti.");
      return;
    }
    setIds(key, (list) => [...list, id]);
    setAnnounce(`Aggiunto: ${songsById.get(id)?.title ?? "canto"}`);
  }

  function move(key: string, index: number, delta: number) {
    setIds(key, (ids) => {
      const next = [...ids];
      const j = index + delta;
      if (j < 0 || j >= next.length) return ids;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function remove(key: string, index: number) {
    const title = songsById.get(idsOf(data, key)[index])?.title;
    setIds(key, (ids) => ids.filter((_, i) => i !== index));
    setAnnounce(`Rimosso: ${title ?? "canto"}`);
  }

  function updateExtra(index: number, patch: Partial<SetlistExtra>) {
    setData((d) => ({ ...d, extras: d.extras.map((e, j) => (j === index ? { ...e, ...patch } : e)) }));
  }

  function addExtra() {
    if (data.extras.length >= LIMITS.extras) return;
    setData((d) => ({ ...d, extras: [...d.extras, { label: "", after: "finale", songs: [], uid: newUid() }] }));
    setAnnounce("Aggiunto un momento speciale in fondo alla scaletta.");
  }

  function placeLabel(d: SetlistData, index: number) {
    const e = d.extras[index];
    return `${e.label || "Momento speciale"}: ${extraPositionLabel(e.after).toLowerCase()}`;
  }

  /** Sposta il momento speciale con le frecce della tastiera (un posto alla volta). */
  function nudgeExtra(index: number, delta: number) {
    const slot = extraSlot(data, index);
    const r = placeExtra(data, index, slot + delta);
    if (extraSlot(r.data, r.index) === slot) return;
    setOpenPicker(null);
    setData(r.data);
    setAnnounce(placeLabel(r.data, r.index));
    const uid = r.data.extras[r.index].uid;
    requestAnimationFrame(() => {
      listRef.current?.querySelector<HTMLElement>(`[data-drag-uid="${uid}"]`)?.focus();
    });
  }

  /** Trascinamento con mouse o dito: la riga si sposta mentre la si muove. */
  function startDrag(uid: string, event: React.PointerEvent) {
    event.preventDefault();
    setOpenPicker(null);
    setDragUid(uid);

    let lastY = event.clientY;
    const reposition = () => {
      const d = dataRef.current;
      const index = d.extras.findIndex((x) => x.uid === uid);
      if (index < 0 || !listRef.current) return;
      const others = [...listRef.current.querySelectorAll<HTMLElement>("[data-section-key]")].filter(
        (el) => el.dataset.sectionKey !== extraKey(index)
      );
      const to = others.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top + r.height / 2 < lastY;
      }).length;
      if (to === extraSlot(d, index)) return;
      const r = placeExtra(d, index, to);
      dataRef.current = r.data;
      setData(r.data);
    };
    // Vicino ai bordi della finestra la pagina scorre da sola, anche a dito fermo.
    const EDGE = 90;
    const autoScroll = window.setInterval(() => {
      const step = lastY < EDGE ? -14 : lastY > window.innerHeight - EDGE ? 14 : 0;
      if (step) {
        window.scrollBy(0, step);
        reposition();
      }
    }, 16);
    const onMove = (e: PointerEvent) => {
      lastY = e.clientY;
      reposition();
    };
    const onUp = () => {
      window.clearInterval(autoScroll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      setDragUid(null);
      const d = dataRef.current;
      const index = d.extras.findIndex((x) => x.uid === uid);
      if (index >= 0) setAnnounce(placeLabel(d, index));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function removeExtra(index: number) {
    setOpenPicker(null);
    setData((d) => ({ ...d, extras: d.extras.filter((_, j) => j !== index) }));
    setAnnounce("Momento speciale rimosso.");
  }

  function makeLink() {
    setError("");
    router.push(setlistUrlPath(output));
  }

  function save() {
    setError("");
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
          <label htmlFor={`${formId}-date`}>Data della celebrazione</label>
          <input
            id={`${formId}-date`}
            type="date"
            className="ls-input"
            value={data.date ?? ""}
            onChange={(e) => {
              const value = e.target.value || null;
              const feast = value && isValidLiturgicalDate(value) ? liturgicalDay(value).title : null;
              setData((d) => ({ ...d, date: value, feast }));
            }}
          />
        </div>
        {day && (
          <p className="ls-note" aria-live="polite">
            <strong>{day.title}</strong>
            <br />
            <span className="ls-small ls-muted">
              {day.seasonLabel} · colore {COLOR_LABELS[day.color].toLowerCase()}
              {day.isSunday ? ` · anno ${day.sundayCycle}` : ""}
            </span>
          </p>
        )}
      </section>

      <p className="ls-sr" role="status" aria-live="polite">
        {announce}
      </p>

      <div className="ls-stack" ref={listRef}>
      {sections.map((section) => {
        const i = section.extraIndex;
        const extra = i !== null ? data.extras[i] : null;
        return (
          <MomentSection
            key={extra?.uid ?? section.key}
            moment={section.key}
            label={section.label}
            ids={section.songIds}
            songsById={songsById}
            catalog={catalog}
            season={season}
            open={openPicker === section.key}
            onToggle={() => setOpenPicker((o) => (o === section.key ? null : section.key))}
            onAdd={(id) => addSong(section.key, id)}
            onMove={(n, d) => move(section.key, n, d)}
            onRemove={(n) => remove(section.key, n)}
            extra={
              extra && i !== null
                ? {
                    label: extra.label,
                    uid: extra.uid ?? "",
                    dragging: dragUid !== null && dragUid === extra.uid,
                    onLabel: (label) => updateExtra(i, { label }),
                    onDragStart: (e) => extra.uid && startDrag(extra.uid, e),
                    onNudge: (delta) => nudgeExtra(i, delta),
                    onDelete: () => removeExtra(i),
                  }
                : null
            }
          />
        );
      })}
      </div>

      {data.extras.length < LIMITS.extras && (
        <button type="button" className="ls-btn ls-add-extra" onClick={addExtra}>
          + Aggiungi momento speciale
        </button>
      )}

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

type ExtraControls = {
  label: string;
  uid: string;
  dragging: boolean;
  onLabel: (label: string) => void;
  onDragStart: (event: React.PointerEvent) => void;
  onNudge: (delta: number) => void;
  onDelete: () => void;
};

type SectionProps = {
  /** Slug del momento oppure `extra:N`. */
  moment: string;
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
  /** Presente solo per i momenti speciali: nome e posizione modificabili. */
  extra: ExtraControls | null;
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
  extra,
}: SectionProps) {
  const headingId = useId();
  const pickerId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isExtra = extra !== null;

  return (
    <section
      className={`ls-section${isExtra ? " ls-section--extra" : ""}${extra?.dragging ? " is-dragging" : ""}`}
      aria-labelledby={headingId}
      data-section-key={moment}
    >
      <div className="ls-section-head">
        {extra ? (
          <div className="ls-extra-head">
            <button
              type="button"
              className="ls-drag"
              data-drag-uid={extra.uid}
              aria-label={`Sposta il momento speciale ${label}: trascina, oppure usa le frecce su e giù`}
              title="Trascina per spostare"
              onPointerDown={extra.onDragStart}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                  extra.onNudge(e.key === "ArrowUp" ? -1 : 1);
                }
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="9" cy="6" r="1.6" />
                <circle cx="15" cy="6" r="1.6" />
                <circle cx="9" cy="12" r="1.6" />
                <circle cx="15" cy="12" r="1.6" />
                <circle cx="9" cy="18" r="1.6" />
                <circle cx="15" cy="18" r="1.6" />
              </svg>
            </button>
            <h2 id={headingId} className="ls-sr">
              Momento speciale: {label}
            </h2>
            <input
              className="ls-input ls-extra-name"
              value={extra.label}
              maxLength={LIMITS.extraLabel}
              placeholder="Nome del momento, es. Ingresso degli sposi"
              aria-label="Nome del momento speciale"
              onChange={(e) => extra.onLabel(e.target.value)}
            />
            <button
              type="button"
              className="ls-btn ls-btn--icon ls-btn--danger"
              aria-label={`Rimuovi il momento speciale ${label}`}
              onClick={extra.onDelete}
            >
              ×
            </button>
          </div>
        ) : (
          <h2 id={headingId}>
            {label}
            {ids.length > 0 && <span className="ls-sr">, {ids.length} {ids.length === 1 ? "canto" : "canti"}</span>}
          </h2>
        )}
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
  moment: string;
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
        const forMoment = isMoment(moment) && s.moments.includes(moment);
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
          ? `Suggeriti per ${isMoment(moment) ? momentLabel(moment) : "questo momento"}${season ? ` e ${seasonLabel(season)}` : ""}. Puoi cercare qualunque canto.`
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
