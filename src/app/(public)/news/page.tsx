import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import NewsList from "@/components/NewsList";

export const metadata: Metadata = { title: "News" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type Props = { searchParams: Promise<{ anno?: string; pagina?: string }> };

export default async function NewsPage({ searchParams }: Props) {
  const { anno, pagina } = await searchParams;

  const allArticles = await db.query.articles.findMany({
    where: eq(articles.published, true),
    orderBy: [desc(articles.publishedAt)],
  });

  const years = [
    ...new Set(
      allArticles
        .filter((a) => a.publishedAt)
        .map((a) => new Date(a.publishedAt!).getFullYear()),
    ),
  ].sort((a, b) => b - a);

  const selectedYear = anno ? parseInt(anno, 10) : null;
  const yearFiltered = selectedYear
    ? allArticles.filter(
        (a) =>
          a.publishedAt &&
          new Date(a.publishedAt).getFullYear() === selectedYear,
      )
    : allArticles;

  const total = yearFiltered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(
    Math.max(1, parseInt(pagina ?? "1", 10)),
    totalPages,
  );
  const list = yearFiltered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <>
      <section style={{ paddingTop: 64, paddingBottom: 32 }}>
        <div className="container">
          <span className="kicker">News &amp; Eventi</span>
          <h1 style={{ marginTop: 20, maxWidth: "20ch" }}>
            La vita della comunità,{" "}
            <span
              style={{
                background:
                  "linear-gradient(90deg, var(--azure-deep), var(--azure))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              giorno per giorno
            </span>
            .
          </h1>
        </div>
      </section>

      <NewsList
        items={list.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          coverImageUrl: a.coverImageUrl,
          publishedAt: a.publishedAt,
        }))}
        years={years}
        selectedYear={selectedYear}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </>
  );
}
