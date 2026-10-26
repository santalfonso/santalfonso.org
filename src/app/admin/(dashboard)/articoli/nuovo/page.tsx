import Link from "next/link";
import { createArticle } from "@/actions/articles";
import ArticleForm from "@/components/admin/ArticleForm";
import { requireStaffPage } from "@/auth";

export default async function NuovoArticoloPage() {
  await requireStaffPage();
  return (
    <>
      <Link href="/admin/articoli" className="admin-back">← Articoli</Link>
      <div className="admin-page-head">
        <h1>Nuovo articolo</h1>
      </div>
      <ArticleForm action={createArticle} />
    </>
  );
}
