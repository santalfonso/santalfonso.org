import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { deleteEvent } from "@/actions/events";
import DeleteButton from "@/components/admin/DeleteButton";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminEventiPage() {
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
        <table className="admin-table">
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
                <td style={{ fontWeight: 600 }}>{event.title}</td>
                <td className="mute">{formatDateTime(event.startsAt)}</td>
                <td className="mute">{event.location ?? "—"}</td>
                <td className="right">
                  <div className="admin-table-actions">
                    <Link href={`/admin/eventi/${event.id}`} className="admin-link">
                      Modifica
                    </Link>
                    <DeleteButton
                      action={deleteEvent.bind(null, event.id)}
                      confirmMessage={`Eliminare l'evento "${event.title}"?`}
                    />
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
