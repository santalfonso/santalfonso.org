import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { updateArticle } from "@/actions/articles";
import ArticleForm from "@/components/admin/ArticleForm";
import { db } from "@/db";
import { articles, articleImages } from "@/db/schema";
import { canEditContent, requireStaffPage } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ModificaArticoloPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireStaffPage();
  const { id } = await params;
  const articleId = Number(id);
  if (isNaN(articleId)) notFound();

  const [article, gallery] = await Promise.all([
    db.query.articles.findFirst({ where: eq(articles.id, articleId) }),
    db.query.articleImages.findMany({ where: eq(articleImages.articleId, articleId) }),
  ]);
  if (!article) notFound();
  // l'editor modifica solo gli articoli creati da lui
  if (!canEditContent(me, article.createdBy)) redirect("/admin/articoli");

  return (
    <>
      <Link href="/admin/articoli" className="admin-back">← Articoli</Link>
      <div className="admin-page-head">
        <h1>Modifica articolo</h1>
      </div>
      <ArticleForm action={updateArticle.bind(null, articleId)} article={article} galleryImages={gallery} />
    </>
  );
}
