"use client";

import { useActionState } from "react";
import type { Event } from "@/db/schema";
import type { ActionState } from "@/actions/articles";

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
    <form action={formAction} className="admin-form">
      <div className="admin-form-row">
        <label htmlFor="title" className="admin-label">Titolo *</label>
        <input
          id="title"
          name="title"
          required
          defaultValue={event?.title}
          className="admin-input"
        />
      </div>

      <div className="admin-grid-2 admin-form-row">
        <div>
          <label htmlFor="startsAt" className="admin-label">Inizio *</label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toLocalInput(event?.startsAt)}
            className="admin-input"
          />
        </div>
        <div>
          <label htmlFor="endsAt" className="admin-label">Fine (facoltativa)</label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toLocalInput(event?.endsAt)}
            className="admin-input"
          />
        </div>
      </div>

      <div className="admin-form-row">
        <label htmlFor="location" className="admin-label">Luogo</label>
        <input
          id="location"
          name="location"
          defaultValue={event?.location ?? ""}
          placeholder="Es. Chiesa parrocchiale, Salone, Cappella Santa Elisabetta…"
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="description" className="admin-label">Descrizione</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={event?.description ?? ""}
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="posterImage" className="admin-label">
          Locandina
          {event?.posterUrl ? " (sostituisce quella attuale)" : ""}
        </label>
        {event?.posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.posterUrl}
            alt="Locandina attuale"
            className="admin-img-preview"
          />
        )}
        <input
          id="posterImage"
          name="posterImage"
          type="file"
          accept="image/*"
          style={{ fontSize: 13, color: "var(--ink-soft)" }}
        />
        <p className="admin-input-hint">
          Opzionale. Se assente verrà mostrato un formato grafico automatico.
        </p>
      </div>

      {state?.error && (
        <div className="admin-error" style={{ marginBottom: 20 }}>{state.error}</div>
      )}

      <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
        {pending ? "Salvataggio…" : "Salva evento"}
      </button>
    </form>
  );
}
