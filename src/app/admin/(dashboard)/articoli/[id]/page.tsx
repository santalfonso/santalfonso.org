import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateArticle } from "@/actions/articles";
import ArticleForm from "@/components/admin/ArticleForm";
import { db } from "@/db";
import { articles } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function ModificaArticoloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const articleId = Number(id);
  if (isNaN(articleId)) notFound();

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, articleId),
  });
  if (!article) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">
        Modifica articolo
      </h1>
      <ArticleForm action={updateArticle.bind(null, articleId)} article={article} />
    </>
  );
}
