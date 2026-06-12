import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateEvent } from "@/actions/events";
import EventForm from "@/components/admin/EventForm";
import { db } from "@/db";
import { events } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function ModificaEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  if (isNaN(eventId)) notFound();

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event) notFound();

  return (
    <>
      <Link href="/admin/eventi" className="admin-back">← Eventi</Link>
      <div className="admin-page-head">
        <h1>Modifica evento</h1>
      </div>
      <EventForm action={updateEvent.bind(null, eventId)} event={event} />
    </>
  );
}
