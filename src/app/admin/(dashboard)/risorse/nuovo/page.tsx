import Link from "next/link";
import ResourceForm from "@/components/admin/ResourceForm";

export default function NuovaRisorsaPage() {
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
