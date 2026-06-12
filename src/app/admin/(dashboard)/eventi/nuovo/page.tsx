import Link from "next/link";
import { createEvent } from "@/actions/events";
import EventForm from "@/components/admin/EventForm";

export default function NuovoEventoPage() {
  return (
    <>
      <Link href="/admin/eventi" className="admin-back">← Eventi</Link>
      <div className="admin-page-head">
        <h1>Nuovo evento</h1>
      </div>
      <EventForm action={createEvent} />
    </>
  );
}
