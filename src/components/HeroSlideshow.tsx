"use client";

import { useState, useEffect, useRef } from "react";
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
    photo: { src: "/chiesa.avif", srcSet: "/chiesa-600.avif 600w, /chiesa.avif 911w", position: "center" },
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
      // copia ridotta: la foto è mostrata al massimo in un riquadro di circa 500 px
      src: `${CDN}/c_limit,w_1000/v1781359289/santalfonso/storia/storia-prima-pietra.avif`,
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
  const [dir, setDir] = useState<"right" | "left">("right");
  // la prima slide compare subito, senza animazione: è il primo contenuto della pagina
  const [animate, setAnimate] = useState(false);
  // l'avanzamento automatico si ferma quando lo slideshow non è visibile
  const [visible, setVisible] = useState(true);
  const slide = slides[current];
  const touchStartX = useRef<number>(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-avanzamento: riavvia il countdown a ogni cambio slide (non con "riduci movimento")
  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(() => {
      setAnimate(true);
      setDir("right");
      setCurrent((c) => (c + 1) % slides.length);
    }, 6000);
    return () => clearTimeout(id);
  }, [current, visible]);

  function goNext() {
    setAnimate(true);
    setDir("right");
    setCurrent((c) => (c + 1) % slides.length);
  }

  function goPrev() {
    setAnimate(true);
    setDir("left");
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }

  function goTo(i: number) {
    setAnimate(true);
    setDir(i > current ? "right" : "left");
    setCurrent(i);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) <= 50) return;
    if (delta > 0) goNext();
    else goPrev();
  }

  return (
    <section className="hero" ref={sectionRef}>
      <div className="container">
        {/* Tutte le slide stanno nella stessa cella della griglia: l'altezza è sempre quella
            della più alta e la pagina sotto non si sposta a ogni cambio. Le slide non attive
            sono invisibili e senza foto (al posto della foto c'è un riquadro della stessa forma). */}
        <div
          style={{ overflow: "hidden", display: "grid" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((s, i) => {
            const active = i === current;
            return (
              <div
                key={active ? `${s.id}-${current}` : s.id}
                className="hero-grid"
                aria-hidden={!active}
                inert={!active}
                style={{
                  gridArea: "1 / 1",
                  visibility: active ? "visible" : "hidden",
                  ...(s.reverse ? { direction: "rtl" as const } : {}),
                  ...(active && animate
                    ? { animation: `hero-slide-${dir} 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both` }
                    : {}),
                }}
              >
                <div style={s.reverse ? { direction: "ltr" } : undefined}>
                  {s.content}
                </div>
                <div style={{ position: "relative", direction: "ltr" }}>
                  {active ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.photo.src}
                      srcSet={"srcSet" in s.photo ? s.photo.srcSet : undefined}
                      sizes="(max-width: 900px) 100vw, 540px"
                      alt=""
                      fetchPriority={i === 0 ? "high" : "auto"}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        objectFit: "cover",
                        objectPosition: s.photo.position,
                        borderRadius: "var(--r-md)",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div style={{ width: "100%", aspectRatio: "1" }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigazione slideshow */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 32 }}>
          <button
            onClick={goPrev}
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
                onClick={() => goTo(i)}
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
            onClick={goNext}
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
