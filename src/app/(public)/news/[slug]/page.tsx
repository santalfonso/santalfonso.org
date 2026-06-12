import { and, desc, eq, ne } from "drizzle-orm";
import { marked } from "marked";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getArticle(slug: string) {
  return db.query.articles.findFirst({
    where: and(eq(articles.slug, slug), eq(articles.published, true)),
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  return { title: article?.title ?? "Articolo" };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [html, related] = await Promise.all([
    marked.parse(article.body),
    db.query.articles.findMany({
      where: and(eq(articles.published, true), ne(articles.id, article.id)),
      orderBy: [desc(articles.publishedAt)],
      limit: 3,
    }),
  ]);

  return (
    <>
      <section style={{ paddingTop: 32, paddingBottom: 0 }}>
        <div className="container-narrow">
          <div style={{ fontSize: 13, color: "var(--ink-mute)" }}>
            <Link href="/news" style={{ color: "var(--ink-mute)" }}>
              News
            </Link>{" "}
            / {article.title}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 24, paddingBottom: 40 }}>
        <div className="container-narrow">
          <span className="tag tag--azure">News</span>
          <h1 style={{ marginTop: 16 }}>{article.title}</h1>
          {article.excerpt && (
            <p className="lead" style={{ marginTop: 16 }}>
              {article.excerpt}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              fontSize: 13,
              color: "var(--ink-mute)",
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid var(--rule)",
            }}
          >
            <span>{formatDate(article.publishedAt)}</span>
            <span>·</span>
            <span>Parrocchia Sant&apos;Alfonso</span>
          </div>
        </div>
      </section>

      {article.coverImageUrl && (
        <section style={{ padding: 0 }}>
          <div className="container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImageUrl}
              alt=""
              style={{
                aspectRatio: "21/9",
                width: "100%",
                objectFit: "cover",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--rule)",
              }}
            />
          </div>
        </section>
      )}

      <section>
        <div className="container-narrow">
          <div
            className="prose-parish"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div
            style={{
              marginTop: 48,
              paddingTop: 24,
              borderTop: "1px solid var(--rule)",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Link href="/news" className="btn btn--ghost">
              ← Torna alle news
            </Link>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section style={{ background: "var(--bg-soft)" }}>
          <div className="container">
            <div className="section-header">
              <div>
                <span className="kicker">Continua a leggere</span>
                <h2 style={{ marginTop: 14 }}>Articoli correlati</h2>
              </div>
            </div>
            <div className="rel-grid">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="card"
                  style={{
                    background: "var(--bg)",
                    padding: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {item.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverImageUrl}
                      alt=""
                      style={{
                        aspectRatio: "16/10",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="ph ph--landscape" style={{ borderRadius: 0, border: 0 }}>
                      <span className="ph__label">foto</span>
                    </div>
                  )}
                  <div
                    style={{
                      padding: 22,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>
                      {formatDate(item.publishedAt)}
                    </div>
                    <h4 style={{ fontSize: 17 }}>{item.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
