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
      <div className="admin-page-head">
        <h1>Utenti</h1>
        <Link href="/admin/utenti/nuovo" className="admin-btn admin-btn-primary">
          + Nuovo utente
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Ruolo</th>
              <th>Creato il</th>
              <th className="right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {list.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td className="mute">{user.email}</td>
                <td>
                  <span
                    className="admin-badge"
                    style={
                      user.role === "admin"
                        ? {
                            background: "var(--gold-soft)",
                            color: "var(--gold-deep)",
                            border: "1px solid var(--gold)",
                          }
                        : {
                            background: "var(--bg-soft)",
                            color: "var(--ink-mute)",
                            border: "1px solid var(--rule)",
                          }
                    }
                  >
                    {user.role}
                  </span>
                </td>
                <td className="mute">{formatDate(user.createdAt)}</td>
                <td className="right">
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
