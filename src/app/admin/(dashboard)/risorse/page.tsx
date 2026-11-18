import Link from "next/link";
import { requireStaffPage } from "@/auth";
import { deleteResource, moveCategory, setCategoryActive } from "@/actions/resources";
import CategoryActiveToggle from "@/components/admin/CategoryActiveToggle";
import DeleteButton from "@/components/admin/DeleteButton";
import { getCategoriesWithFiles } from "@/lib/resources-data";
import { sizedImage } from "@/lib/image-url";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminRisorsePage() {
  await requireStaffPage();
  const { categories, uncategorized } = await getCategoriesWithFiles();

  return (
    <>
      <div className="admin-page-head">
        <h1>Risorse</h1>
        <Link href="/admin/risorse/categorie/nuova" className="admin-btn admin-btn-primary">
          + Nuova categoria
        </Link>
      </div>
      <p className="res-intro">
        Ogni categoria ha una foto e contiene i file da scaricare. Apri una categoria per caricare i file; con le frecce
        scegli l&apos;ordine in cui compaiono nella pagina Risorse. Una categoria nascosta non compare nel sito e i suoi
        file non si possono scaricare.
      </p>

      {categories.length === 0 ? (
        <div className="admin-card">
          <p className="admin-table-empty">Nessuna categoria. Creane una con &ldquo;Nuova categoria&rdquo;.</p>
        </div>
      ) : (
        <ul className="res-cats">
          {categories.map((c, i) => (
            <li key={c.id} className={`res-cat${c.active ? "" : " is-hidden"}`}>
              <Link href={`/admin/risorse/categorie/${c.id}`} className="res-cat__media" tabIndex={-1} aria-hidden="true">
                {c.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sizedImage(c.imageUrl, 600)} alt="" style={{ objectPosition: c.imageFocus ?? undefined }} loading="lazy" />
                )}
              </Link>
              <div className="res-cat__body">
                <Link href={`/admin/risorse/categorie/${c.id}`} className="res-cat__name">
                  {c.name}
                </Link>
                {c.description && <p className="res-cat__desc">{c.description}</p>}
                <p className="res-cat__count">
                  {c.files.length} file
                </p>
                <CategoryActiveToggle active={c.active} name={c.name} action={setCategoryActive.bind(null, c.id)} />
              </div>
              <div className="res-cat__actions">
                <Link href={`/admin/risorse/categorie/${c.id}`} className="admin-btn admin-btn-ghost">
                  Apri
                </Link>
                <form action={moveCategory.bind(null, c.id, -1)}>
                  <button className="res-move" disabled={i === 0} aria-label={`Sposta "${c.name}" più in alto`}>↑</button>
                </form>
                <form action={moveCategory.bind(null, c.id, 1)}>
                  <button className="res-move" disabled={i === categories.length - 1} aria-label={`Sposta "${c.name}" più in basso`}>↓</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {uncategorized.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 className="res-h2">File senza categoria</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <tbody>
                {uncategorized.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td className="mute">{formatDate(r.createdAt)}</td>
                    <td className="right">
                      <DeleteButton action={deleteResource.bind(null, r.id)} confirmMessage={`Eliminare "${r.title}"?`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
