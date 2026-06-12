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
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Modifica evento</h1>
      <EventForm action={updateEvent.bind(null, eventId)} event={event} />
    </>
  );
}
