"use client";

import { useState } from "react";
import Link from "next/link";

const BLUE = {
  background: "linear-gradient(90deg, var(--azure-deep), var(--azure))",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent",
  backgroundClip: "text" as const,
};

const GOLD = {
  background: "linear-gradient(90deg, var(--gold-deep), var(--gold))",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent",
  backgroundClip: "text" as const,
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 28, lineHeight: 1, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--ink)" }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 6 }}>{label}</div>
    </div>
  );
}

const CDN = "https://res.cloudinary.com/dksk2bjyd/image/upload";

const slides = [
  {
    id: "quote",
    reverse: false,
    photo: { src: "/chiesa.avif", position: "center" },
    content: (
      <div>
        <span className="kicker">Comunità · Prima Porta, Roma</span>
        <h2 style={{ marginTop: 20 }}>
          &ldquo;Chi non vuole altro che{" "}
          <span style={BLUE}>Dio</span>, sta sempre contento in{" "}
          <span style={BLUE}>ogni cosa</span>{" "}che accade&rdquo;
        </h2>
        <p className="lead" style={{ marginTop: 20, maxWidth: "44ch" }}>
          Sant&apos;Alfonso Maria de&apos; Liguori,<br />
          vescovo e dottore della Chiesa.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
          <Link href="/#orari" className="btn btn--primary">Orari delle Messe</Link>
          <Link href="/news" className="btn btn--ghost">Ultime news</Link>
        </div>
        <div style={{ display: "flex", gap: 32, marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--rule)", flexWrap: "wrap" }}>
          <Stat label="Anno di fondazione" value="1975" />
          <Stat label="Abitanti nel territorio" value="17.000" />
        </div>
      </div>
    ),
  },
  {
    id: "giubileo",
    reverse: true,
    photo: {
      src: `${CDN}/v1781359289/santalfonso/storia/storia-prima-pietra.avif`,
      position: "center",
    },
    content: (
      <div>
        <h2 style={{ marginTop: 0 }}>
          <span style={GOLD}>50 anni</span> di parrocchia,{" "}
          <span style={GOLD}>25 anni</span> di chiesa.
        </h2>
        <p className="lead" style={{ marginTop: 20, maxWidth: "48ch" }}>
          In occasione del 50° anniversario dell&apos;erezione della parrocchia
          e del 25° anniversario della dedicazione della nuova chiesa, è stato
          istituito l&apos;<span style={GOLD}>Anno Giubilare Parrocchiale</span>{" "}
          in cui è possibile ricevere l&apos;indulgenza plenaria.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
          <Link
            href="/giubileo/indulgenza-plenaria"
            className="btn"
            style={{
              background: "linear-gradient(90deg, var(--gold-deep), var(--gold))",
              borderColor: "transparent",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Cos&apos;è e come riceverla
          </Link>
        </div>
        <div style={{ display: "flex", gap: 32, marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--rule)", flexWrap: "wrap" }}>
          <Stat label="Anno di fondazione" value="1975" />
          <Stat label="Anno di dedicazione" value="2000" />
          <Stat label="Anno Giubilare Parrocchiale" value="2025" />
        </div>
      </div>
    ),
  },
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const slide = slides[current];

  return (
    <section className="hero">
      <div className="container">
        <div
          className="hero-grid"
          style={slide.reverse ? { direction: "rtl" } : undefined}
        >
          <div style={slide.reverse ? { direction: "ltr" } : undefined}>
            {slide.content}
          </div>
          <div style={{ position: "relative", direction: "ltr" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.photo.src}
              alt=""
              style={{
                width: "100%",
                aspectRatio: "1",
                objectFit: "cover",
                objectPosition: slide.photo.position,
                borderRadius: "var(--r-md)",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* Navigazione slideshow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 32 }}>
          <button
            onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
            aria-label="Slide precedente"
            style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "1px solid var(--rule)",
              background: "var(--bg)",
              color: "var(--ink)",
              fontSize: 20, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background var(--t)",
            }}
          >
            ‹
          </button>

          <div style={{ display: "flex", gap: 8 }}>
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                aria-label={`Vai alla slide ${i + 1}`}
                style={{
                  width: i === current ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: "none",
                  background: i === current
                    ? (slide.id === "giubileo" ? "var(--gold)" : "var(--azure)")
                    : "var(--rule)",
                  cursor: "pointer",
                  transition: "width 0.3s, background 0.3s",
                  padding: 0,
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrent((c) => (c + 1) % slides.length)}
            aria-label="Slide successiva"
            style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "1px solid var(--rule)",
              background: "var(--bg)",
              color: "var(--ink)",
              fontSize: 20, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background var(--t)",
            }}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
