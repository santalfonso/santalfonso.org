import { and, eq } from "drizzle-orm";
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

  const html = await marked.parse(article.body);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/news" className="text-sm text-amber-700 hover:underline">
        ← Tutte le news
      </Link>
      <p className="mt-6 text-sm uppercase tracking-wide text-stone-400">
        {formatDate(article.publishedAt)}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-amber-900">
        {article.title}
      </h1>
      {article.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImageUrl}
          alt=""
          className="mt-6 w-full rounded-lg object-cover"
        />
      )}
      <div
        className="prose-parish mt-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
