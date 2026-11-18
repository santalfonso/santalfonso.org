import { sizedImage } from "@/lib/image-url";
import type { Libro } from "@/lib/libri";

/** Griglia dei libri consigliati (Santo titolare, Risorse): copertina, titolo, didascalia e link ad Amazon. */
export default function BookGrid({ libri, showAuthor = false }: { libri: Libro[]; showAuthor?: boolean }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: 24,
    }}>
      {libri.map((libro) => (
        <div
          key={libro.amazonUrl}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sizedImage(libro.coverUrl, 320)}
            loading="lazy"
            decoding="async"
            alt={libro.titolo}
            style={{
              width: "100%",
              aspectRatio: "2/3",
              objectFit: "cover",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--rule)",
              display: "block",
              boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            {showAuthor && (
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--gold-deep)" }}>
                {libro.autore}
              </div>
            )}
            <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>
              {libro.titolo}
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-mute)", lineHeight: 1.5 }}>
              {libro.didascalia}
            </div>
            <a
              href={libro.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--primary"
              style={{ marginTop: "auto", fontSize: 13, textAlign: "center", textDecoration: "none" }}
            >
              Acquista su Amazon
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
