import { createArticle } from "@/actions/articles";
import ArticleForm from "@/components/admin/ArticleForm";

export default function NuovoArticoloPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Nuovo articolo</h1>
      <ArticleForm action={createArticle} />
    </>
  );
}
