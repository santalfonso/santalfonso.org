import { redirect } from "next/navigation";
import { auth } from "@/auth";
import UserForm from "@/components/admin/UserForm";

export default async function NuovoUtentePage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin");

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Nuovo utente</h1>
      <UserForm />
    </>
  );
}
