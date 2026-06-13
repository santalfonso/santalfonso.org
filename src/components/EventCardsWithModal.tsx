"use client";

import { useState } from "react";
import { formatDayNumber, formatMonthName, formatTime, formatDate } from "@/lib/utils";

type EventItem = {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  posterUrl: string | null;
  startsAt: string;
  endsAt: string | null;
};

function EventPoster({ event }: { event: EventItem }) {
  if (event.posterUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={event.posterUrl}
        alt={`Locandina: ${event.title}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
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
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          borderRadius: "var(--r-lg, 16px)",
          overflow: "hidden",
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
          position: "relative",
        }}
      >
        {/* X chiudi */}
        <button
          onClick={onClose}
          aria-label="Chiudi"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: "rgba(0,0,0,0.35)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Poster */}
        <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
          <EventPoster event={event} />
        </div>

        {/* Contenuto */}
        <div style={{ padding: "28px 28px 32px" }}>
          {/* Data badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              borderRadius: "var(--r-pill)",
              background: "var(--azure-soft)",
              color: "var(--azure-deep)",
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>
              {formatDayNumber(event.startsAt)}
            </span>
            <span style={{ textTransform: "capitalize" }}>
              {formatMonthName(event.startsAt)}
            </span>
          </div>

          <h2 style={{ marginBottom: 16, lineHeight: 1.2 }}>{event.title}</h2>

          {/* Dettagli */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14 }}>
              <span style={{ color: "var(--ink-mute)", minWidth: 60 }}>Inizio</span>
              <span style={{ fontWeight: 500 }}>
                {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
              </span>
            </div>
            {event.endsAt && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14 }}>
                <span style={{ color: "var(--ink-mute)", minWidth: 60 }}>Fine</span>
                <span style={{ fontWeight: 500 }}>
                  {formatDate(event.endsAt)} · {formatTime(event.endsAt)}
                </span>
              </div>
            )}
            {event.location && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14 }}>
                <span style={{ color: "var(--ink-mute)", minWidth: 60 }}>Luogo</span>
                <span style={{ fontWeight: 500 }}>{event.location}</span>
              </div>
            )}
          </div>

          {event.description && (
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-soft)", margin: 0 }}>
              {event.description}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}

export default function EventCardsWithModal({ events }: { events: EventItem[] }) {
  const [selected, setSelected] = useState<EventItem | null>(null);

  return (
    <>
      <div className="events-grid">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => setSelected(event)}
            className="card"
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
              <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden", flexShrink: 0 }}>
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
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <EventModal event={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
