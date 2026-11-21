import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { deleteEvent } from "@/actions/events";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatDateTime } from "@/lib/utils";
import { canEditContent, isAdmin, requireStaffPage } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminEventiPage() {
  const me = await requireStaffPage();
  const admin = isAdmin(me.role);
  const list = await db.query.events.findMany({
    orderBy: [desc(events.startsAt)],
  });

  return (
    <>
      <div className="admin-page-head">
        <h1>Eventi</h1>
        <Link href="/admin/eventi/nuovo" className="admin-btn admin-btn-primary">
          + Nuovo evento
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-table--stack">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Inizio</th>
              <th>Luogo</th>
              <th className="right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-table-empty">
                  Nessun evento. Creane uno con &ldquo;Nuovo evento&rdquo;.
                </td>
              </tr>
            )}
            {list.map((event) => (
              <tr key={event.id}>
                <td className="stack-title" style={{ fontWeight: 600 }}>{event.title}</td>
                <td className="mute stack-meta">{formatDateTime(event.startsAt)}</td>
                <td className="mute stack-meta">{event.location ?? "—"}</td>
                <td className="right stack-action">
                  <div className="admin-table-actions">
                    {canEditContent(me, event.createdBy) && (
                      <Link href={`/admin/eventi/${event.id}`} className="admin-link">
                        Modifica
                      </Link>
                    )}
                    {admin && (
                      <DeleteButton
                        action={deleteEvent.bind(null, event.id)}
                        confirmMessage={`Eliminare l'evento "${event.title}"?`}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
