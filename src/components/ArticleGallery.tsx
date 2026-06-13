"use client";

import { useState } from "react";

type Image = { id: number; url: string };

export default function ArticleGallery({ images }: { images: Image[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  function prev() {
    setLightbox((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }
  function next() {
    setLightbox((i) => (i === null ? null : (i + 1) % images.length));
  }
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") setLightbox(null);
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 8,
        }}
      >
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightbox(i)}
            style={{
              padding: 0,
              border: "none",
              borderRadius: 8,
              overflow: "hidden",
              cursor: "zoom-in",
              aspectRatio: "1",
              background: "var(--bg-soft)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          onKeyDown={onKey}
          tabIndex={0}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
          }}
        >
          {/* Freccia sinistra */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              style={{
                position: "absolute",
                left: 16,
                background: "rgba(255,255,255,0.12)",
                border: "none",
                borderRadius: "50%",
                width: 44,
                height: 44,
                color: "#fff",
                fontSize: 22,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ‹
            </button>
          )}

          {/* Immagine */}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightbox].url}
              alt=""
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: 8,
                display: "block",
              }}
            />
          </div>

          {/* Freccia destra */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              style={{
                position: "absolute",
                right: 16,
                background: "rgba(255,255,255,0.12)",
                border: "none",
                borderRadius: "50%",
                width: 44,
                height: 44,
                color: "#fff",
                fontSize: 22,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ›
            </button>
          )}

          {/* X */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "rgba(255,255,255,0.12)",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>

          {/* Contatore */}
          {images.length > 1 && (
            <div style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
            }}>
              {lightbox + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
