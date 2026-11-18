import Link from "next/link";
import { requireStaffPage } from "@/auth";
import { createCategory } from "@/actions/resources";
import CategoryForm from "@/components/admin/CategoryForm";

export default async function NuovaCategoriaPage() {
  await requireStaffPage();
  return (
    <>
      <Link href="/admin/risorse" className="admin-back">← Risorse</Link>
      <div className="admin-page-head">
        <h1>Nuova categoria</h1>
      </div>
      <p className="res-intro">Dopo aver creato la categoria potrai caricare i file al suo interno.</p>
      <CategoryForm action={createCategory} />
    </>
  );
}
