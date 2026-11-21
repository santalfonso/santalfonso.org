import Link from "next/link";
import { requireSuperAdminPage } from "@/auth";
import UserForm from "@/components/admin/UserForm";
import { manageableRoles } from "@/lib/roles";

export default async function NuovoUtentePage() {
  const me = await requireSuperAdminPage();

  return (
    <>
      <Link href="/admin/utenti" className="admin-back">← Utenti</Link>
      <div className="admin-page-head">
        <h1>Nuovo utente</h1>
      </div>
      <UserForm roles={manageableRoles(me.role)} />
    </>
  );
}
