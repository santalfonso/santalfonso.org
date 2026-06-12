import { createEvent } from "@/actions/events";
import EventForm from "@/components/admin/EventForm";

export default function NuovoEventoPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-stone-800">Nuovo evento</h1>
      <EventForm action={createEvent} />
    </>
  );
}
