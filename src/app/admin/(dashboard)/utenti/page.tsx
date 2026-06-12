import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { deleteUser } from "@/actions/users";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUtentiPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/admin");

  const list = await db.query.users.findMany();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Utenti</h1>
        <Link
          href="/admin/utenti/nuovo"
          className="rounded bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
        >
          + Nuovo utente
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Ruolo</th>
              <th className="px-4 py-3">Creato il</th>
              <th className="px-4 py-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {list.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium text-stone-800">
                  {user.name}
                </td>
                <td className="px-4 py-3 text-stone-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {String(user.id) !== session.user.id && (
                    <DeleteButton
                      action={deleteUser.bind(null, user.id)}
                      confirmMessage={`Eliminare l'utente ${user.name}? Non potrà più accedere.`}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
