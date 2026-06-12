import Link from "next/link";
import { createArticle } from "@/actions/articles";
import ArticleForm from "@/components/admin/ArticleForm";

export default function NuovoArticoloPage() {
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
