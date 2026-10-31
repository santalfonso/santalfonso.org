"use client";

import { useActionState, useState, startTransition } from "react";
import type { Event } from "@/db/schema";
import type { ActionState } from "@/actions/articles";
import { isoToRomeLocal } from "@/lib/utils";
import ImageDropzone from "./ImageDropzone";

export default function EventForm({
  action,
  event,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  event?: Event;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // invio senza il reset automatico di React 19: dopo un errore i campi restano compilati
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => formAction(data));
  };
  const [uploading, setUploading] = useState(false);

  return (
    <form onSubmit={submit} className="admin-form">
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
            defaultValue={isoToRomeLocal(event?.startsAt)}
            className="admin-input"
          />
        </div>
        <div>
          <label htmlFor="endsAt" className="admin-label">Fine (facoltativa)</label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={isoToRomeLocal(event?.endsAt)}
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

      <ImageDropzone
        name="posterImage"
        currentUrl={event?.posterUrl}
        label="Locandina"
        onUploadingChange={setUploading}
      />

      {state?.error && (
        <div className="admin-error" style={{ marginBottom: 20 }}>{state.error}</div>
      )}

      <button type="submit" disabled={pending || uploading} className="admin-btn admin-btn-primary">
        {uploading ? "Caricamento locandina…" : pending ? "Salvataggio…" : "Salva evento"}
      </button>
    </form>
  );
}
