"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { setFavorite } from "@/actions/lodate/favorites";
import { saveAnnotations } from "@/actions/lodate/annotations";
import { saveSongSettings } from "@/actions/lodate/song-settings";
import {
  detectKey,
  hasChords,
  italianKeyName,
  normalizeSemitones,
  parseChordPro,
  songLanguages,
  transposeKeyInfo,
  transposeSong,
} from "@/lib/lodate/chordpro";
import {
  ANNOTATION_MARKS,
  momentLabel,
  seasonLabel,
  type Annotation,
  type AnnotationMark,
} from "@/lib/lodate/constants";
import SongSheet, { annotationKey, type SelectedWord } from "./SongSheet";

export type ViewerSong = {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  copyrightNote: string | null;
  musicalKey: string | null;
  /** Tasto del Barrè per cui sono scritti gli accordi (1-5), null = senza Barrè. */
  capo: number | null;
  body: string;
  published: boolean;
};

const CAPO_LABELS = ["Nessuno", "I", "II", "III", "IV", "V"];

const FONT_SIZES = [14, 16, 18, 20, 22, 24, 27, 30, 34, 38];
const DEFAULT_SIZE = 2;
/** Velocità di scorrimento (px al secondo) per i livelli 1…10. */
const SPEEDS = [6, 10, 14, 19, 25, 32, 40, 50, 62, 76];
const DEFAULT_SPEED = 3;
const PREFS_KEY = "lodate-prefs-v1";

type Prefs = { chords: boolean; size: number; speed: number };
const DEFAULT_PREFS: Prefs = { chords: true, size: DEFAULT_SIZE, speed: DEFAULT_SPEED };

function readPrefs(): Prefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const p = JSON.parse(raw) as Partial<Prefs>;
    const clamp = (n: unknown, max: number, def: number) =>
      typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= max ? n : def;
    return {
      chords: typeof p.chords === "boolean" ? p.chords : DEFAULT_PREFS.chords,
      size: clamp(p.size, FONT_SIZES.length - 1, DEFAULT_SIZE),
      speed: clamp(p.speed, SPEEDS.length - 1, DEFAULT_SPEED),
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function writePrefs(p: Prefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* modalità privata o storage bloccato: le preferenze valgono solo per questa visita */
  }
}

type WakeLockSentinelLike = { release: () => Promise<void> };
type NavigatorWithWakeLock = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
};

/**
 * Chrome ed Edge stampano il piè di pagina su ogni pagina con @page; gli altri
 * browser usano quello in fondo al canto. Il segno serve al CSS di stampa.
 */
function markPrintEngine(el: HTMLElement | null) {
  if (!el) return;
  const chromium = "chrome" in window || /Chrome\/|Chromium\/|Edg\//.test(navigator.userAgent);
  el.dataset.engine = chromium ? "chromium" : "other";
}

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "]);

export default function SongViewer({
  song,
  moments,
  seasons,
  loggedIn,
  loginHref,
  initialFavorite,
  initialAnnotations,
  initialSettings,
}: {
  song: ViewerSong;
  moments: string[];
  seasons: string[];
  loggedIn: boolean;
  loginHref: string;
  initialFavorite: boolean;
  initialAnnotations: Annotation[];
  /** Trasposizione e Barrè salvati dall'utente per questo canto, se ci sono. */
  initialSettings: { transpose: number; capo: number } | null;
}) {
  // Canti in più lingue: si mostra una versione alla volta.
  const languages = useMemo(() => songLanguages(song.body), [song.body]);
  const [lang, setLang] = useState<string | null>(languages[0] ?? null);
  const parsed = useMemo(() => parseChordPro(song.body, lang), [song.body, lang]);
  const withChords = useMemo(() => hasChords(parsed), [parsed]);
  const baseKey = useMemo(() => detectKey(parsed, song.musicalKey), [parsed, song.musicalKey]);

  // ── Preferenze (ricordate sul dispositivo) ──
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const prefsLoaded = useRef(false);
  useEffect(() => {
    // Lette dopo il montaggio per non creare differenze con l'HTML del server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs(readPrefs());
    prefsLoaded.current = true;
  }, []);
  const updatePrefs = useCallback((patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      if (prefsLoaded.current) writePrefs(next);
      return next;
    });
  }, []);
  const showChords = withChords && prefs.chords;

  // ── Trasposizione e Barrè ──
  // Gli accordi sono scritti per il Barrè del canto (song.capo). `transpose` sposta il
  // suono di tutto il canto; cambiando il Barrè le posizioni degli accordi si adeguano
  // in modo che il canto suoni nella stessa tonalità.
  const songCapo = song.capo ?? 0;
  const [transpose, setTranspose] = useState(initialSettings?.transpose ?? 0);
  const [capo, setCapo] = useState(initialSettings?.capo ?? songCapo);
  const shapeShift = normalizeSemitones(transpose + songCapo - capo);
  const shown = useMemo(
    () => transposeSong(parsed, shapeShift, song.musicalKey),
    [parsed, shapeShift, song.musicalKey]
  );
  const currentKey = baseKey ? italianKeyName(transposeKeyInfo(baseKey, shapeShift)) : null;
  const originalKey = baseKey ? italianKeyName(baseKey) : null;
  const shiftLabel = transpose === 0 ? "originale" : `${transpose > 0 ? "+" : "−"}${Math.abs(transpose)}`;
  const capoLabel = capo > 0 ? `Barrè al ${CAPO_LABELS[capo]} tasto` : "";

  // Salvataggio per l'utente collegato (dopo una breve pausa).
  const [settingsState, setSettingsState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const settingsTimer = useRef<number | undefined>(undefined);
  const firstSettings = useRef(true);
  useEffect(() => {
    if (firstSettings.current) {
      firstSettings.current = false;
      return;
    }
    if (!loggedIn) return;
    window.clearTimeout(settingsTimer.current);
    settingsTimer.current = window.setTimeout(async () => {
      setSettingsState("saving");
      try {
        const res = await saveSongSettings(song.id, transpose, capo);
        setSettingsState("error" in res ? "error" : "saved");
      } catch {
        setSettingsState("error");
      }
    }, 800);
    return () => window.clearTimeout(settingsTimer.current);
  }, [transpose, capo, loggedIn, song.id]);

  // ── Autoscorrimento ──
  const [playing, setPlaying] = useState(false);
  const controlsRefs = useRef<HTMLElement[]>([]);
  const registerControls = useCallback((el: HTMLElement | null) => {
    if (el && !controlsRefs.current.includes(el)) controlsRefs.current.push(el);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pxPerSec = SPEEDS[prefs.speed];
    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let pos = window.scrollY;
    let raf = 0;
    let interval: number | undefined;

    if (reduce) {
      // Movimento ridotto: piccoli scatti senza animazione invece di uno scorrimento continuo.
      const step = Math.round(FONT_SIZES[prefs.size] * 3);
      interval = window.setInterval(() => {
        if (atBottom()) return setPlaying(false);
        window.scrollBy({ top: step, behavior: "instant" as ScrollBehavior });
      }, (step / pxPerSec) * 1000);
    } else {
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        pos += pxPerSec * dt;
        window.scrollTo({ top: pos, behavior: "instant" as ScrollBehavior });
        if (atBottom()) {
          setPlaying(false);
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    // Si ferma al tocco o allo scorrimento manuale (non sui controlli).
    const inControls = (t: EventTarget | null) =>
      t instanceof Node && controlsRefs.current.some((el) => el.contains(t));
    const stop = (e: Event) => {
      if (inControls(e.target)) return;
      if (e instanceof KeyboardEvent && !SCROLL_KEYS.has(e.key)) return;
      setPlaying(false);
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("mousedown", stop);
    window.addEventListener("keydown", stop);
    return () => {
      cancelAnimationFrame(raf);
      if (interval) window.clearInterval(interval);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("mousedown", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [playing, prefs.speed, prefs.size]);

  // Schermo sempre acceso durante lo scorrimento (Wake Lock API, se disponibile).
  useEffect(() => {
    if (!playing) return;
    const nav = navigator as NavigatorWithWakeLock;
    if (!nav.wakeLock) return;
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const acquire = async () => {
      try {
        const s = await nav.wakeLock!.request("screen");
        if (cancelled) s.release().catch(() => {});
        else sentinel = s;
      } catch {
        /* non consentito (batteria scarica, scheda nascosta…) */
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") acquire();
    };
    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [playing]);

  // ── Preferito ──
  const [favorite, setFav] = useState(initialFavorite);
  const [favPending, startFav] = useTransition();
  const [favError, setFavError] = useState<string | null>(null);
  const toggleFavorite = () => {
    const next = !favorite;
    setFav(next);
    setFavError(null);
    startFav(async () => {
      const res = await setFavorite(song.id, next);
      if ("error" in res) {
        setFav(!next);
        setFavError(res.error);
      }
    });
  };

  // ── Annotazioni ──
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [annotating, setAnnotating] = useState(false);
  const [selected, setSelected] = useState<SelectedWord | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimer = useRef<number | undefined>(undefined);
  const panelRef = useRef<HTMLDivElement>(null);

  const marks = useMemo(() => {
    const m = new Map<string, AnnotationMark>();
    for (const a of annotations) m.set(annotationKey(a.line, a.col), a.mark);
    return m;
  }, [annotations]);

  const scheduleSave = (list: Annotation[]) => {
    setSaveState("saving");
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        const res = await saveAnnotations(song.id, list);
        setSaveState("error" in res ? "error" : "saved");
      } catch {
        setSaveState("error");
      }
    }, 700);
  };
  useEffect(() => () => window.clearTimeout(saveTimer.current), []);

  const closePanel = useCallback(() => {
    const key = selected ? annotationKey(selected.line, selected.col) : null;
    setSelected(null);
    if (key) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[data-annot="${key}"]`)?.focus();
      });
    }
  }, [selected]);

  const applyMark = (mark: AnnotationMark | null) => {
    if (!selected) return;
    const rest = annotations.filter((a) => !(a.line === selected.line && a.col === selected.col));
    const next = mark ? [...rest, { line: selected.line, col: selected.col, mark }] : rest;
    setAnnotations(next);
    scheduleSave(next);
    closePanel();
  };


  useEffect(() => {
    if (!selected) return;
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closePanel]);

  const selectedMark = selected ? marks.get(annotationKey(selected.line, selected.col)) : undefined;
  const fontSize = FONT_SIZES[prefs.size];

  return (
    <article className="lodate-viewer" style={{ ["--lodate-fs" as string]: `${fontSize}px` }}>
      <header className="lodate-song-head">
        {!song.published && <span className="lodate-badge lodate-badge--draft">Bozza (non pubblicato)</span>}
        <h2 className="lodate-song-title">{song.title}</h2>
        {song.author && <p className="lodate-song-author">{song.author}</p>}
        <p className="lodate-print-only lodate-print-meta">
          {showChords && currentKey ? `Tonalità: ${currentKey}` : ""}
          {showChords && transpose !== 0 && originalKey ? ` (originale ${originalKey})` : ""}
          {showChords && capoLabel ? ` · ${capoLabel}` : ""}
        </p>
        {(moments.length > 0 || seasons.length > 0) && (
          <ul className="lodate-badges lodate-no-print" aria-label="Momenti e tempi">
            {moments.map((m) => (
              <li key={m}>
                <Link href={`/lodate?momento=${m}`} className="lodate-badge lodate-badge--moment">
                  {momentLabel(m)}
                </Link>
              </li>
            ))}
            {seasons.map((s) => (
              <li key={s}>
                <Link href={`/lodate?tempo=${s}`} className="lodate-badge lodate-badge--season">
                  {seasonLabel(s)}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {languages.length > 1 && (
          <div className="lodate-langs lodate-no-print" role="group" aria-label="Lingua del canto">
            {languages.map((l) => (
              <button
                key={l}
                type="button"
                className={`lodate-lang${l === lang ? " is-on" : ""}`}
                aria-pressed={l === lang}
                onClick={() => {
                  setLang(l);
                  setSelected(null);
                }}
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="lodate-tools lodate-no-print" ref={registerControls} role="toolbar" aria-label="Strumenti del canto">
        {withChords && (
          <button
            type="button"
            className={`lodate-btn${prefs.chords ? " is-on" : ""}`}
            aria-pressed={prefs.chords}
            onClick={() => updatePrefs({ chords: !prefs.chords })}
          >
            <ChordIcon /> Accordi
          </button>
        )}
        {loggedIn && (
          <button
            type="button"
            className={`lodate-btn${annotating ? " is-on" : ""}`}
            aria-pressed={annotating}
            onClick={() => {
              setAnnotating((a) => !a);
              setSelected(null);
            }}
          >
            <PenIcon /> {annotating ? "Fine annotazioni" : "Annota"}
          </button>
        )}
        <button type="button" className="lodate-btn" onClick={() => window.print()}>
          <PrintIcon /> Stampa
        </button>
        {loggedIn && (
          <button
            type="button"
            className={`lodate-btn${favorite ? " is-on" : ""}`}
            aria-pressed={favorite}
            aria-label={favorite ? "Preferito: togli dai preferiti" : "Aggiungi ai preferiti"}
            disabled={favPending}
            onClick={toggleFavorite}
          >
            <StarIcon filled={favorite} /> Preferito
          </button>
        )}
        <span className="lodate-tools__size" role="group" aria-label="Dimensione del testo">
          <button
            type="button"
            className="lodate-btn lodate-btn--icon"
            aria-label="Testo più piccolo"
            disabled={prefs.size === 0}
            onClick={() => updatePrefs({ size: Math.max(0, prefs.size - 1) })}
          >
            <span className="lodate-a-small">A</span>−
          </button>
          <button
            type="button"
            className="lodate-btn lodate-btn--icon"
            aria-label="Testo più grande"
            disabled={prefs.size === FONT_SIZES.length - 1}
            onClick={() => updatePrefs({ size: Math.min(FONT_SIZES.length - 1, prefs.size + 1) })}
          >
            <span className="lodate-a-big">A</span>+
          </button>
        </span>
      </div>

      {showChords && (
        <div className="lodate-music lodate-no-print" ref={registerControls} role="group" aria-label="Impostazioni musicali">
          <div className="lodate-music__box" role="group" aria-labelledby="lodate-music-key">
            <span id="lodate-music-key" className="lodate-music__label">
              Tonalità
            </span>
            <div className="lodate-music__row">
              <button
                type="button"
                className="lodate-btn lodate-btn--icon"
                aria-label="Abbassa di un semitono"
                onClick={() => setTranspose((t) => normalizeSemitones(t - 1))}
              >
                −
              </button>
              <span className="lodate-key" aria-live="polite" aria-atomic="true">
                <span className="lodate-sr">Tonalità </span>
                {currentKey ?? "Tono"}
                <small> {shiftLabel}</small>
              </span>
              <button
                type="button"
                className="lodate-btn lodate-btn--icon"
                aria-label="Alza di un semitono"
                onClick={() => setTranspose((t) => normalizeSemitones(t + 1))}
              >
                +
              </button>
              {transpose !== 0 && (
                <button
                  type="button"
                  className="lodate-btn lodate-btn--icon lodate-music__reset"
                  aria-label={`Torna alla tonalità originale${originalKey ? ` (${originalKey})` : ""}`}
                  title="Tonalità originale"
                  onClick={() => setTranspose(0)}
                >
                  ↺
                </button>
              )}
            </div>
          </div>

          <div className="lodate-music__box" role="group" aria-labelledby="lodate-music-capo">
            <label id="lodate-music-capo" htmlFor="lodate-capo" className="lodate-music__label">
              Barrè
            </label>
            <div className="lodate-music__row">
              <select
                id="lodate-capo"
                className="lodate-capo__select"
                value={capo}
                onChange={(e) => setCapo(Number(e.target.value))}
              >
                {CAPO_LABELS.map((label, n) => (
                  <option key={n} value={n}>
                    {n === 0 ? label : `${label} tasto`}
                  </option>
                ))}
              </select>
              {capo !== songCapo && (
                <button
                  type="button"
                  className="lodate-btn lodate-btn--icon lodate-music__reset"
                  aria-label={`Torna al Barrè originale (${songCapo > 0 ? `${CAPO_LABELS[songCapo]} tasto` : "nessuno"})`}
                  title="Barrè originale"
                  onClick={() => setCapo(songCapo)}
                >
                  ↺
                </button>
              )}
            </div>
          </div>

          {loggedIn && settingsState === "error" && (
            <p className="lodate-error lodate-music__error" role="status">
              Le tue impostazioni non sono state salvate.
            </p>
          )}
        </div>
      )}

      <div className="lodate-status lodate-no-print" aria-live="polite">
        {favError && <p className="lodate-error">{favError}</p>}
        {annotating && (
          <p className="lodate-hint">
            Tocca una parola per segnare ↑ (salire), ↓ (scendere) o — (restare).{" "}
            {saveState === "saving" && "Salvataggio…"}
            {saveState === "saved" && "Annotazioni salvate."}
            {saveState === "error" && <span className="lodate-error">Errore nel salvataggio: riprova.</span>}
          </p>
        )}
        {!annotating && saveState === "error" && (
          <p className="lodate-error">Le ultime annotazioni non sono state salvate.</p>
        )}
      </div>

      {!loggedIn && (
        <p className="lodate-invite lodate-no-print">
          <Link href={loginHref}>Accedi</Link> per salvare i preferiti e annotare il canto con ↑ ↓.
        </p>
      )}

      <div className={`lodate-sheet-wrap${showChords ? " with-chords" : ""}`}>
        {shown.sections.length === 0 ? (
          <p className="muted">Testo non disponibile.</p>
        ) : (
          <SongSheet
            song={shown}
            showChords={showChords}
            marks={marks}
            annotate={annotating ? { selected, onSelect: setSelected } : null}
            printColumns
          />
        )}
      </div>

      {annotations.length > 0 && (
        <p className="lodate-legend">
          {ANNOTATION_MARKS.map((m) => (
            <span key={m.mark} className={`lodate-legend-item lodate-mk--${m.mark}`}>
              <b aria-hidden="true">{m.symbol}</b> {m.label}
            </span>
          ))}
        </p>
      )}

      {song.copyrightNote && (
        <footer className="lodate-copyright">
          <p>{song.copyrightNote}</p>
        </footer>
      )}

      {/* Piè di pagina della stampa, ripetuto su ogni pagina */}
      <div className="lodate-print-only lodate-print-footer" aria-hidden="true" ref={markPrintEngine}>
        <span>Parrocchia Sant&apos;Alfonso Maria de&apos; Liguori</span>
        <span>santalfonso.org</span>
      </div>

      {selected && (
        <div
          className="lodate-annot-panel lodate-no-print"
          ref={(el) => {
            panelRef.current = el;
            registerControls(el);
          }}
          role="dialog"
          aria-modal="false"
          aria-label={`Annotazione sulla lettera “${selected.text}” di “${selected.word}”`}
        >
          <p className="lodate-annot-word">
            Lettera «<b>{selected.text}</b>» in «{selected.word}»
          </p>
          <div className="lodate-annot-actions">
            {ANNOTATION_MARKS.map((m) => (
              <button
                key={m.mark}
                type="button"
                className={`lodate-btn lodate-btn--mark lodate-mk--${m.mark}${selectedMark === m.mark ? " is-on" : ""}`}
                aria-pressed={selectedMark === m.mark}
                onClick={() => applyMark(m.mark)}
              >
                <b aria-hidden="true">{m.symbol}</b> {m.label}
              </button>
            ))}
            {selectedMark && (
              <button type="button" className="lodate-btn" onClick={() => applyMark(null)}>
                Rimuovi
              </button>
            )}
            <button type="button" className="lodate-btn" onClick={closePanel}>
              Chiudi
            </button>
          </div>
        </div>
      )}

      <div className="lodate-minibar lodate-no-print" ref={registerControls} role="group" aria-label="Scorrimento automatico">
        <button
          type="button"
          className={`lodate-btn lodate-btn--icon lodate-btn--play${playing ? " is-on" : ""}`}
          aria-pressed={playing}
          aria-label={playing ? "Ferma lo scorrimento" : "Avvia lo scorrimento automatico"}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          type="button"
          className="lodate-btn lodate-btn--icon"
          aria-label="Scorrimento più lento"
          disabled={prefs.speed === 0}
          onClick={() => updatePrefs({ speed: Math.max(0, prefs.speed - 1) })}
        >
          −
        </button>
        <span className="lodate-speed" aria-live="polite">
          <span className="lodate-sr">Velocità </span>
          {prefs.speed + 1}
          <span aria-hidden="true">/{SPEEDS.length}</span>
        </span>
        <button
          type="button"
          className="lodate-btn lodate-btn--icon"
          aria-label="Scorrimento più veloce"
          disabled={prefs.speed === SPEEDS.length - 1}
          onClick={() => updatePrefs({ speed: Math.min(SPEEDS.length - 1, prefs.speed + 1) })}
        >
          +
        </button>
        <span className="lodate-minibar-sep" aria-hidden="true" />
        <button
          type="button"
          className="lodate-btn lodate-btn--icon"
          aria-label="Torna all'inizio del canto"
          onClick={() => {
            setPlaying(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          ↑
        </button>
      </div>
    </article>
  );
}

function ChordIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinejoin="round" d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
}
function PenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
    </svg>
  );
}
function PrintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4a1 1 0 01-1-1v-6a2 2 0 012-2h14a2 2 0 012 2v6a1 1 0 01-1 1h-2M6 14h12v7H6z" />
    </svg>
  );
}
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}
