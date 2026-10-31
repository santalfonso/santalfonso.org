import Link from "next/link";
import { requireOwnerPage } from "@/auth";
import UserForm from "@/components/admin/UserForm";

export default async function NuovoUtentePage() {
  await requireOwnerPage();

  return (
    <>
      <Link href="/admin/utenti" className="admin-back">← Utenti</Link>
      <div className="admin-page-head">
        <h1>Nuovo utente</h1>
      </div>
      <UserForm />
    </>
  );
}
