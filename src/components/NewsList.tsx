"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate } from "@/lib/utils";

type ArticleItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
};

function newsUrl(page: number) {
  return page > 1 ? `/news?pagina=${page}` : "/news";
}

function Cover({ url, style }: { url: string | null; style?: React.CSSProperties }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      style={{ aspectRatio: "16/10", width: "100%", objectFit: "cover", ...style }}
    />
  ) : (
    <div className="ph ph--landscape" style={style}>
      <span className="ph__label">foto</span>
    </div>
  );
}

export default function NewsList({
  items,
  currentPage,
  totalPages,
}: {
  items: ArticleItem[];
  currentPage: number;
  totalPages: number;
}) {
  const [layout, setLayout] = useState<"griglia" | "lista">("griglia");

  return (
    <>
      {/* Toolbar: layout toggle */}
      <section style={{ padding: "0 0 8px" }}>
        <div className="container" style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              display: "flex",
              border: "1px solid var(--rule)",
              borderRadius: "var(--r-pill)",
              padding: 3,
              background: "var(--bg)",
            }}
          >
            {(["griglia", "lista"] as const).map((option) => (
              <button
                key={option}
                onClick={() => setLayout(option)}
                style={{
                  padding: "6px 14px",
                  border: 0,
                  borderRadius: "var(--r-pill)",
                  cursor: "pointer",
                  background: layout === option ? "var(--ink)" : "transparent",
                  color: layout === option ? "var(--bg)" : "var(--ink-soft)",
                  fontSize: 13,
                  fontFamily: "var(--sans)",
                  fontWeight: 500,
                  textTransform: "capitalize",
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section style={{ paddingTop: 16 }}>
        <div className="container">
          {items.length === 0 ? (
            <p className="muted">Nessuna notizia pubblicata al momento.</p>
          ) : layout === "griglia" ? (
            <div className="grid-layout">
              {items.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="card"
                  style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  <Cover
                    url={article.coverImageUrl}
                    style={{ borderRadius: 0, border: 0, borderBottom: "1px solid var(--rule)" }}
                  />
                  <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                      {formatDate(article.publishedAt)}
                    </div>
                    <h3 style={{ fontSize: 19 }}>{article.title}</h3>
                    {article.excerpt && (
                      <p style={{ fontSize: 14, marginBottom: 0 }}>{article.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="card news-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "200px 1fr auto",
                    gap: 24,
                    alignItems: "center",
                    padding: 16,
                  }}
                >
                  <Cover url={article.coverImageUrl} style={{ borderRadius: "var(--r-sm)" }} />
                  <div>
                    <div style={{ fontSize: 12, color: "var(--ink-mute)", marginBottom: 6 }}>
                      {formatDate(article.publishedAt)}
                    </div>
                    <h3 style={{ fontSize: 18 }}>{article.title}</h3>
                    {article.excerpt && (
                      <p style={{ fontSize: 14, marginTop: 6, marginBottom: 0 }}>{article.excerpt}</p>
                    )}
                  </div>
                  <span style={{ fontSize: 18, color: "var(--ink-mute)" }}>→</span>
                </Link>
              ))}
              <style>{`
                @media (max-width: 700px) {
                  .news-row { grid-template-columns: 1fr !important; }
                }
              `}</style>
            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section style={{ paddingTop: 16, paddingBottom: 8 }}>
          <div
            className="container"
            style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap" }}
          >
            {currentPage > 1 && (
              <Link
                href={newsUrl(currentPage - 1)}
                style={{
                  padding: "8px 18px",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--r-pill)",
                  fontSize: 14,
                  color: "var(--ink)",
                  textDecoration: "none",
                  background: "var(--bg)",
                }}
              >
                ← Precedente
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={newsUrl(page)}
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid",
                  borderColor: page === currentPage ? "var(--azure)" : "var(--rule)",
                  borderRadius: "var(--r-pill)",
                  fontSize: 14,
                  fontWeight: page === currentPage ? 700 : 400,
                  color: page === currentPage ? "var(--azure)" : "var(--ink-soft)",
                  textDecoration: "none",
                  background: "var(--bg)",
                }}
              >
                {page}
              </Link>
            ))}

            {currentPage < totalPages && (
              <Link
                href={newsUrl(currentPage + 1)}
                style={{
                  padding: "8px 18px",
                  border: "1px solid var(--rule)",
                  borderRadius: "var(--r-pill)",
                  fontSize: 14,
                  color: "var(--ink)",
                  textDecoration: "none",
                  background: "var(--bg)",
                }}
              >
                Successiva →
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  );
}
