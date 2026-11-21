"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDayNumber, formatMonthName, formatTime, formatDate } from "@/lib/utils";
import { sizedImage } from "@/lib/image-url";

type EventItem = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  posterUrl: string | null;
  startsAt: string;
  endsAt: string | null;
};

/** Locandine in formato A4 verticale (210 × 297 mm). */
const POSTER_RATIO = "210 / 297";

function EventPoster({ event, width = 800 }: { event: EventItem; width?: number }) {
  if (event.posterUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={sizedImage(event.posterUrl, width)}
        loading="lazy"
        decoding="async"
        alt={`Locandina: ${event.title}`}
        style={{
          width: "100%",
          height: "100%",
          // locandina sempre intera: niente ritagli se non è esattamente A4
          objectFit: "contain",
          display: "block",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, var(--azure-deep) 0%, #1a4fa0 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "24px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1,
          opacity: 0.95,
        }}
      >
        {formatDayNumber(event.startsAt)}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "rgba(255,255,255,0.75)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {formatMonthName(event.startsAt)}
      </div>
      <div
        style={{
          width: 32,
          height: 1,
          background: "rgba(255,255,255,0.3)",
          margin: "4px 0",
        }}
      />
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          lineHeight: 1.3,
        }}
      >
        {event.title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.65)",
          marginTop: 4,
        }}
      >
        {formatTime(event.startsAt)}
        {event.location ? ` · ${event.location}` : ""}
      </div>
    </div>
  );
}

function EventModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  // locandina a tutto schermo (su mobile la scheda ne mostra solo una miniatura)
  const [zoom, setZoom] = useState(false);
  // sfumatura in fondo finché c'è altro testo da scorrere
  const [moreBelow, setMoreBelow] = useState(false);
  const checkScroll = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    setMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
  }, []);
  const sheetRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // su desktop con locandina scorre solo la colonna dei dati, altrimenti la scheda intera
    const update = () => {
      const split = !!event.posterUrl && window.matchMedia("(min-width: 769px)").matches;
      checkScroll(split ? bodyRef.current : sheetRef.current);
    };
    update();
    window.addEventListener("resize", update);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (zoom) setZoom(false);
      else onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [checkScroll, event.posterUrl, onClose, zoom]);

  return (
    <div className="ev-overlay" onClick={onClose}>
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onScroll={(e) => checkScroll(e.currentTarget)}
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        className={`ev-modal${event.posterUrl ? " ev-modal--poster" : ""}`}
      >
        <span className="ev-modal__handle" aria-hidden="true" />
        <button onClick={onClose} aria-label="Chiudi" className="ev-modal__close">
          ×
        </button>

        {/* Locandina: intera a sinistra su desktop, miniatura ingrandibile su mobile */}
        {event.posterUrl ? (
          <button type="button" className="ev-modal__poster" onClick={() => setZoom(true)} aria-label="Ingrandisci la locandina">
            <EventPoster event={event} width={1200} />
            <span className="ev-modal__zoom" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </span>
          </button>
        ) : (
          <div className="ev-modal__poster">
            <EventPoster event={event} width={1200} />
          </div>
        )}

        {/* Contenuto */}
        <div className="ev-modal__body" ref={bodyRef} onScroll={(e) => checkScroll(e.currentTarget)}>
          <div className="ev-modal__head">
            <div className="ev-modal__date">
              <span className="ev-modal__day">{formatDayNumber(event.startsAt)}</span>
              <span style={{ textTransform: "capitalize" }}>{formatMonthName(event.startsAt)}</span>
            </div>
            <h2 className="ev-modal__title">{event.title}</h2>
          </div>

          <div className="ev-modal__details">
            <dl className="ev-modal__facts">
              <div>
                <dt>Inizio</dt>
                <dd>
                  {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
                </dd>
              </div>
              {event.endsAt && (
                <div>
                  <dt>Fine</dt>
                  <dd>
                    {formatDate(event.endsAt)} · {formatTime(event.endsAt)}
                  </dd>
                </div>
              )}
              {event.location && (
                <div>
                  <dt>Luogo</dt>
                  <dd>{event.location}</dd>
                </div>
              )}
            </dl>

            {event.description && <p className="ev-modal__desc">{event.description}</p>}
          </div>
        </div>

        <div className={`ev-modal__fade${moreBelow ? " is-visible" : ""}`} aria-hidden="true">
          <span>Scorri per leggere</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {zoom && event.posterUrl && (
        <div
          className="ev-zoom"
          onClick={(e) => {
            e.stopPropagation();
            setZoom(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Locandina: ${event.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sizedImage(event.posterUrl, 1600)} alt={`Locandina: ${event.title}`} />
          <button type="button" className="ev-modal__close" aria-label="Chiudi la locandina">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default function EventCardsWithModal({
  events,
  openId,
  extraEvent,
}: {
  events: EventItem[];
  /** evento da aprire subito (link delle notifiche: /?evento=ID) */
  openId?: number;
  /** evento del link che non è tra le card (più lontano nel tempo o già iniziato): solo la scheda */
  extraEvent?: EventItem | null;
}) {
  const router = useRouter();
  const findEvent = (id: number | undefined) =>
    events.find((e) => e.id === id) ?? (extraEvent && extraEvent.id === id ? extraEvent : undefined);
  const [selected, setSelected] = useState<EventItem | null>(() => findEvent(openId) ?? null);
  // la notifica può arrivare mentre la homepage è già aperta (centro notifiche, clic sulla
  // notifica): al cambio di ?evento= la scheda si apre anche senza ricaricare la pagina
  const [lastOpenId, setLastOpenId] = useState(openId);
  if (openId !== lastOpenId) {
    setLastOpenId(openId);
    const target = findEvent(openId);
    if (target) setSelected(target);
  }

  function closeModal() {
    setSelected(null);
    // come per gli avvisi: si toglie ?evento= dall'indirizzo, così la stessa notifica riapre la scheda
    // letto al clic (non con useSearchParams): così /calendario resta una pagina statica
    if (new URLSearchParams(window.location.search).has("evento")) router.replace("/", { scroll: false });
  }

  return (
    <>
      <div className="events-grid">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => setSelected(event)}
            className="card ev-card"
            aria-label={`${event.title}: apri i dettagli`}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              padding: 0,
              overflow: "hidden",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              background: "var(--bg)",
              border: "none",
            }}
          >
            {/* Poster — solo se esiste */}
            {event.posterUrl && (
              <div className="ev-card__poster" style={{ width: "100%", aspectRatio: POSTER_RATIO, overflow: "hidden", flexShrink: 0, background: "var(--bg-soft)" }}>
                <EventPoster event={event} />
              </div>
            )}

            {/* Info */}
            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: "var(--r-pill)",
                  background: "var(--azure-soft)",
                  color: "var(--azure-deep)",
                  fontSize: 11,
                  fontWeight: 600,
                  alignSelf: "flex-start",
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1 }}>
                  {formatDayNumber(event.startsAt)}
                </span>
                <span style={{ textTransform: "capitalize" }}>
                  {formatMonthName(event.startsAt)}
                </span>
              </div>
              <h4 style={{ margin: 0 }}>{event.title}</h4>
              {event.description && (
                <p style={{ fontSize: 13, margin: 0, color: "var(--ink-soft)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  {event.description}
                </p>
              )}
              <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: "auto", paddingTop: 4 }}>
                {formatTime(event.startsAt)}
                {event.location ? ` · ${event.location}` : ""}
              </div>
              <span className="ev-card__more" aria-hidden="true">
                Vedi dettagli <span className="ev-card__arrow">→</span>
              </span>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <EventModal event={selected} onClose={closeModal} />
      )}
    </>
  );
}
