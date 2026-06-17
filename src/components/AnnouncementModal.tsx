"use client";

import { useRouter } from "next/navigation";
import type { Announcement } from "@/db/schema";

export default function AnnouncementModal({ announcement }: { announcement: Announcement }) {
  const router = useRouter();

  function close() {
    router.replace("/", { scroll: false });
  }

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0 0 0 0",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          width: "100%",
          maxWidth: 600,
          borderRadius: "var(--r-lg) var(--r-lg) 0 0",
          padding: "32px 24px 40px",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          animation: "sheet-up 0.3s cubic-bezier(0.25,0.46,0.45,0.94) both",
        }}
      >
        {/* Handle */}
        <div style={{
          width: 40, height: 4, borderRadius: 2,
          background: "var(--rule)",
          margin: "0 auto 24px",
        }} />

        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #1F7AE0, #3399FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M16 3v1.5L8.5 8H5a2 2 0 00-2 2v4a2 2 0 002 2h.5l1.5 5h2l-1.5-5H8.5L16 19.5V21l3-1.5V4.5L16 3zM17 18.1l-7-3.5V9.4l7-3.5v12.2z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Avviso
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", lineHeight: 1.3, margin: 0 }}>
              {announcement.title}
            </h2>
          </div>
        </div>

        <p style={{
          marginTop: 20,
          fontSize: 16,
          color: "var(--ink-mute)",
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
        }}>
          {announcement.text}
        </p>

        <button
          onClick={close}
          className="btn btn--ghost"
          style={{ marginTop: 28, width: "100%" }}
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}
