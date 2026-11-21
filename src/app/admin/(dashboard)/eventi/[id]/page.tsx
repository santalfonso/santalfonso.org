import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { updateEvent } from "@/actions/events";
import EventForm from "@/components/admin/EventForm";
import { db } from "@/db";
import { events } from "@/db/schema";
import { canEditContent, requireStaffPage } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ModificaEventoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await requireStaffPage();
  const { id } = await params;
  const eventId = Number(id);
  if (isNaN(eventId)) notFound();

  const event = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  });
  if (!event) notFound();
  // l'editor modifica solo gli eventi creati da lui
  if (!canEditContent(me, event.createdBy)) redirect("/admin/eventi");

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
