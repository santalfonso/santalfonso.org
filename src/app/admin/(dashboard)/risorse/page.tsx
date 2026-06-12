import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { deleteResource } from "@/actions/resources";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatDate, formatFileSize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminRisorsePage() {
  const list = await db.query.resources.findMany({
    orderBy: [desc(resources.createdAt)],
  });

  return (
    <>
      <div className="admin-page-head">
        <h1>Risorse</h1>
        <Link href="/admin/risorse/nuovo" className="admin-btn admin-btn-primary">
          + Carica risorsa
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Titolo</th>
              <th>Categoria</th>
              <th>File</th>
              <th>Caricata il</th>
              <th className="right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-table-empty">
                  Nessuna risorsa. Caricane una con &ldquo;Carica risorsa&rdquo;.
                </td>
              </tr>
            )}
            {list.map((resource) => (
              <tr key={resource.id}>
                <td style={{ fontWeight: 600 }}>{resource.title}</td>
                <td className="mute">{resource.category}</td>
                <td>
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-link"
                  >
                    {resource.fileName}
                  </a>
                  {resource.fileSize ? (
                    <span className="mute" style={{ marginLeft: 4, fontSize: 12 }}>
                      ({formatFileSize(resource.fileSize)})
                    </span>
                  ) : null}
                </td>
                <td className="mute">{formatDate(resource.createdAt)}</td>
                <td className="right">
                  <DeleteButton
                    action={deleteResource.bind(null, resource.id)}
                    confirmMessage={`Eliminare la risorsa "${resource.title}"? Il link di download smetterà di funzionare.`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
