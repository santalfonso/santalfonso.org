"use client";

import { startTransition, useActionState, useState } from "react";
import type { ResourceFormState } from "@/actions/resources";
import DeleteButton from "./DeleteButton";

type Row = { id: number; title: string; description: string | null; fileName: string; size: string; date: string };

/** Un file della categoria: si apre, si rinomina sul posto o si elimina. */
export default function ResourceRow({
  file,
  update,
  remove,
}: {
  file: Row;
  update: (prev: ResourceFormState, formData: FormData) => Promise<ResourceFormState>;
  remove: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(async (prev: ResourceFormState, data: FormData) => {
    const result = await update(prev, data);
    if (result?.success) setEditing(false);
    return result;
  }, undefined);

  if (editing) {
    return (
      <tr>
        <td colSpan={3}>
          <form
            className="res-edit"
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              startTransition(() => formAction(data));
            }}
          >
            <input name="title" defaultValue={file.title} required maxLength={200} className="admin-input" aria-label="Titolo" />
            <input
              name="description"
              defaultValue={file.description ?? ""}
              maxLength={2000}
              placeholder="Descrizione (facoltativa)"
              className="admin-input"
              aria-label="Descrizione"
            />
            <div className="res-edit__actions">
              <button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
                {pending ? "Salvataggio…" : "Salva"}
              </button>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setEditing(false)}>
                Annulla
              </button>
            </div>
            {state?.error && <div className="admin-error">{state.error}</div>}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>
        <a href={`/risorse/${file.id}/file`} target="_blank" rel="noopener noreferrer" className="admin-link" style={{ fontWeight: 600 }}>
          {file.title}
        </a>
        <div className="res-sub">{[file.description, file.size].filter(Boolean).join(" · ")}</div>
      </td>
      <td className="mute res-nowrap res-hide-sm">{file.date}</td>
      <td className="right">
        <div className="admin-table-actions">
          <button type="button" className="admin-btn-link" onClick={() => setEditing(true)}>
            Modifica
          </button>
          <DeleteButton
            action={remove}
            confirmMessage={`Eliminare "${file.title}"? Il link di download smetterà di funzionare.`}
          />
        </div>
      </td>
    </tr>
  );
}
