import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { deleteArticle } from "@/actions/articles";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminArticoliPage() {
  const list = await db.query.articles.findMany({
    orderBy: [desc(articles.createdAt)],
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Articoli</h1>
        <Link
          href="/admin/articoli/nuovo"
          className="rounded bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
        >
          + Nuovo articolo
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3">Titolo</th>
              <th className="px-4 py-3">Stato</th>
              <th className="px-4 py-3">Pubblicato il</th>
              <th className="px-4 py-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                  Nessun articolo. Creane uno con “Nuovo articolo”.
                </td>
              </tr>
            )}
            {list.map((article) => (
              <tr key={article.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium text-stone-800">
                  {article.title}
                </td>
                <td className="px-4 py-3">
                  {article.published ? (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Pubblicato
                    </span>
                  ) : (
                    <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-500">
                      Bozza
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {formatDate(article.publishedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/articoli/${article.id}`}
                      className="text-sm font-medium text-amber-700 hover:underline"
                    >
                      Modifica
                    </Link>
                    <DeleteButton
                      action={deleteArticle.bind(null, article.id)}
                      confirmMessage={`Eliminare l'articolo “${article.title}”?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
