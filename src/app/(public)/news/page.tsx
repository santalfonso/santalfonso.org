import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import NewsList from "@/components/NewsList";

export const metadata: Metadata = { title: "News" };
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const list = await db.query.articles.findMany({
    where: eq(articles.published, true),
    orderBy: [desc(articles.publishedAt)],
  });

  return (
    <>
      <section style={{ paddingTop: 64, paddingBottom: 32 }}>
        <div className="container">
          <span className="kicker">News &amp; Eventi</span>
          <h1 style={{ marginTop: 20, maxWidth: "20ch" }}>
            La vita della comunità,{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>giorno per giorno</span>.
          </h1>
        </div>
      </section>

      <NewsList
        items={list.map((article) => ({
          id: article.id,
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          coverImageUrl: article.coverImageUrl,
          publishedAt: article.publishedAt,
        }))}
      />
    </>
  );
}
