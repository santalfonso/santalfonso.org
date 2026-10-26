import Link from "next/link";
import ResourceForm from "@/components/admin/ResourceForm";
import { requireStaffPage } from "@/auth";

export default async function NuovaRisorsaPage() {
  await requireStaffPage();
  return (
    <>
      <Link href="/admin/risorse" className="admin-back">← Risorse</Link>
      <div className="admin-page-head">
        <h1>Carica risorsa</h1>
      </div>
      <ResourceForm />
    </>
  );
}
