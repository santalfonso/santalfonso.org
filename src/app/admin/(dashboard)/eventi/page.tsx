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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">Eventi</h1>
        <Link
          href="/admin/eventi/nuovo"
          className="rounded bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900"
        >
          + Nuovo evento
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Inizio</th>
              <th className="px-4 py-3">Luogo</th>
              <th className="px-4 py-3 text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-stone-400">
                  Nessun evento. Creane uno con “Nuovo evento”.
                </td>
              </tr>
            )}
            {list.map((event) => (
              <tr key={event.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium text-stone-800">
                  {event.title}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {formatDateTime(event.startsAt)}
                </td>
                <td className="px-4 py-3 text-stone-500">
                  {event.location ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/eventi/${event.id}`}
                      className="text-sm font-medium text-amber-700 hover:underline"
                    >
                      Modifica
                    </Link>
                    <DeleteButton
                      action={deleteEvent.bind(null, event.id)}
                      confirmMessage={`Eliminare l'evento “${event.title}”?`}
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
