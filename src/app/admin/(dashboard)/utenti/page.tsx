import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { requireSuperAdminPage, ROLE_LABEL } from "@/auth";
import { db } from "@/db";
import { accountRequests, passwordTokens } from "@/db/schema";
import { deleteUser } from "@/actions/users";
import AccountRequestCard from "@/components/admin/AccountRequestCard";
import DeleteButton from "@/components/admin/DeleteButton";
import SendPasswordLinkButton from "@/components/admin/SendPasswordLinkButton";
import { canManageRole, manageableRoles } from "@/lib/roles";
import { formatDate } from "@/lib/utils";

/** Data e ora di una richiesta (salvata in UTC, mostrata con l'ora di Roma). */
function receivedLabel(createdAt: string): string {
  // datetime('now') di SQLite non ha la "Z": è comunque UTC
  const iso = /[zZ]|[+-]\d\d:\d\d$/.test(createdAt) ? createdAt : `${createdAt.replace(" ", "T")}Z`;
  return new Date(iso).toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const dynamic = "force-dynamic";

export default async function AdminUtentiPage() {
  const me = await requireSuperAdminPage();

  const [list, requests, tokenStats] = await Promise.all([
    db.query.users.findMany(),
    db.query.accountRequests.findMany({
      where: eq(accountRequests.status, "pending"),
      orderBy: [desc(accountRequests.createdAt)],
    }),
    // utenti che hanno ricevuto il link ma non hanno ancora scelto la password
    db
      .select({
        userId: passwordTokens.userId,
        used: sql<number>`sum(case when ${passwordTokens.usedAt} is not null then 1 else 0 end)`,
      })
      .from(passwordTokens)
      .groupBy(passwordTokens.userId),
  ]);
  const awaitingPassword = new Set(tokenStats.filter((t) => Number(t.used) === 0).map((t) => t.userId));
  const registered = new Set(list.map((u) => u.email.toLowerCase()));
  const roles = manageableRoles(me.role);

  return (
    <>
      <div className="admin-page-head">
        <h1>Utenti</h1>
        <Link href="/admin/utenti/nuovo" className="admin-btn admin-btn-primary">
          + Nuovo utente
        </Link>
      </div>

      {requests.length > 0 && (
        <section className="admin-requests" aria-labelledby="richieste-titolo">
          <h2 id="richieste-titolo" className="admin-requests__title">
            Richieste di account <span className="admin-requests__count">{requests.length}</span>
          </h2>
          <div className="admin-requests__list">
            {requests.map((r) => (
              <AccountRequestCard
                key={r.id}
                roles={roles}
                receivedLabel={receivedLabel(r.createdAt)}
                request={{
                  id: r.id,
                  name: r.name,
                  email: r.email,
                  message: r.message,
                  createdAt: r.createdAt,
                  alreadyRegistered: registered.has(r.email.toLowerCase()),
                }}
              />
            ))}
          </div>
        </section>
      )}

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
                      user.role === "owner"
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
                    {ROLE_LABEL[user.role]}
                  </span>
                  {awaitingPassword.has(user.id) && (
                    <span className="admin-badge admin-badge-pending" style={{ marginLeft: 6 }}>
                      Password da scegliere
                    </span>
                  )}
                </td>
                <td className="mute">{formatDate(user.createdAt)}</td>
                <td className="right">
                  {String(user.id) !== me.id && canManageRole(me.role, user.role) && (
                    <div className="admin-table-actions">
                      <SendPasswordLinkButton userId={user.id} name={user.name} />
                      <DeleteButton
                        action={deleteUser.bind(null, user.id)}
                        confirmMessage={`Eliminare l'utente ${user.name}? Non potrà più accedere.`}
                      />
                    </div>
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
