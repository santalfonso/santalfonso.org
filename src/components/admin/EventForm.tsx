"use client";

import { useActionState } from "react";
import type { Event } from "@/db/schema";
import type { ActionState } from "@/actions/articles";

const inputClass =
  "w-full rounded border border-stone-300 px-3 py-2 focus:border-amber-600 focus:outline-none";

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventForm({
  action,
  event,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  event?: Event;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-stone-700">
          Titolo *
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={event?.title}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="startsAt" className="mb-1 block text-sm font-medium text-stone-700">
            Inizio *
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toLocalInput(event?.startsAt)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="endsAt" className="mb-1 block text-sm font-medium text-stone-700">
            Fine (facoltativa)
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toLocalInput(event?.endsAt)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="mb-1 block text-sm font-medium text-stone-700">
          Luogo
        </label>
        <input
          id="location"
          name="location"
          defaultValue={event?.location ?? ""}
          placeholder="Es. Chiesa parrocchiale, Salone, Cappella Santa Elisabetta…"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-stone-700">
          Descrizione
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={event?.description ?? ""}
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-amber-800 px-6 py-2 font-semibold text-white hover:bg-amber-900 disabled:opacity-50"
      >
        {pending ? "Salvataggio…" : "Salva evento"}
      </button>
    </form>
  );
}
