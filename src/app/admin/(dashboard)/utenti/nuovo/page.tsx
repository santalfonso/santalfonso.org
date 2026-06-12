import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import UserForm from "@/components/admin/UserForm";

export default async function NuovoUtentePage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin");

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
