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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Risorse</h1>
        <Link
          href="/admin/risorse/nuovo"
          className="rounded bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
        >
          + Carica risorsa
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3">Titolo</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Caricata il</th>
              <th className="px-4 py-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-stone-400">
                  Nessuna risorsa. Caricane una con “Carica risorsa”.
                </td>
              </tr>
            )}
            {list.map((resource) => (
              <tr key={resource.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium text-stone-800">
                  {resource.title}
                </td>
                <td className="px-4 py-3 text-stone-500">{resource.category}</td>
                <td className="px-4 py-3 text-stone-500">
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-700 hover:underline"
                  >
                    {resource.fileName}
                  </a>
                  {resource.fileSize
                    ? ` (${formatFileSize(resource.fileSize)})`
                    : ""}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {formatDate(resource.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton
                    action={deleteResource.bind(null, resource.id)}
                    confirmMessage={`Eliminare la risorsa “${resource.title}”? Il link di download smetterà di funzionare.`}
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
