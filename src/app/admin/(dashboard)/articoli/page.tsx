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
      <div className="admin-page-head">
        <h1>Articoli</h1>
        <Link href="/admin/articoli/nuovo" className="admin-btn admin-btn-primary">
          + Nuovo articolo
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Stato</th>
              <th>Data</th>
              <th className="right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-table-empty">
                  Nessun articolo. Creane uno con &ldquo;Nuovo articolo&rdquo;.
                </td>
              </tr>
            )}
            {list.map((article) => (
              <tr key={article.id}>
                <td style={{ fontWeight: 600 }}>{article.title}</td>
                <td>
                  {article.published ? (
                    <span className="admin-badge admin-badge-pub">Pubblicato</span>
                  ) : (
                    <span className="admin-badge admin-badge-draft">Bozza</span>
                  )}
                </td>
                <td className="mute">{formatDate(article.publishedAt)}</td>
                <td className="right">
                  <div className="admin-table-actions">
                    <Link href={`/admin/articoli/${article.id}`} className="admin-link">
                      Modifica
                    </Link>
                    <DeleteButton
                      action={deleteArticle.bind(null, article.id)}
                      confirmMessage={`Eliminare l'articolo "${article.title}"?`}
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
