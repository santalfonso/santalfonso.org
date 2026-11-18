import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaffPage } from "@/auth";
import { createResource, deleteCategory, deleteResource, updateCategory, updateResource } from "@/actions/resources";
import CategoryForm from "@/components/admin/CategoryForm";
import DeleteButton from "@/components/admin/DeleteButton";
import ResourceForm from "@/components/admin/ResourceForm";
import ResourceRow from "@/components/admin/ResourceRow";
import { getCategoriesWithFiles } from "@/lib/resources-data";
import { formatDate, formatFileSize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffPage();
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) notFound();
  const { categories } = await getCategoriesWithFiles();
  const category = categories.find((c) => c.id === Number(id));
  if (!category) notFound();

  return (
    <>
      <Link href="/admin/risorse" className="admin-back">← Risorse</Link>
      <div className="admin-page-head">
        <h1>{category.name}</h1>
        <Link href={`/risorse#categoria-${category.id}`} target="_blank" className="admin-btn admin-btn-ghost">
          Vedi sul sito ↗
        </Link>
      </div>

      <div className="res-layout">
        <section className="admin-card" aria-labelledby="res-files">
          <div className="admin-card-body">
            <h2 id="res-files" className="res-h2">File ({category.files.length})</h2>
            {category.files.length === 0 ? (
              <p className="res-empty">Nessun file in questa categoria: aggiungine uno qui sotto.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Titolo</th>
                      <th className="res-hide-sm">Caricato il</th>
                      <th className="right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {category.files.map((f) => (
                      <ResourceRow
                        key={f.id}
                        file={{
                          id: f.id,
                          title: f.title,
                          description: f.description,
                          fileName: f.fileName,
                          size: formatFileSize(f.fileSize),
                          date: formatDate(f.createdAt),
                        }}
                        update={updateResource.bind(null, f.id)}
                        remove={deleteResource.bind(null, f.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="res-h3">Aggiungi un file</h3>
            <ResourceForm action={createResource.bind(null, category.id)} />
          </div>
        </section>

        <aside className="admin-card" aria-labelledby="res-cat-data">
          <div className="admin-card-body">
            <h2 id="res-cat-data" className="res-h2">Categoria</h2>
            <CategoryForm action={updateCategory.bind(null, category.id)} category={category} />
            <div className="res-danger">
              <DeleteButton
                action={deleteCategory.bind(null, category.id)}
                label="Elimina categoria"
                doneHref="/admin/risorse"
                confirmMessage={`Eliminare la categoria "${category.name}" e ${
                  category.files.length === 1 ? "il suo file" : `tutti i suoi ${category.files.length} file`
                }? I link di download smetteranno di funzionare.`}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
