"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/articles";
import { createResource } from "@/actions/resources";

export default function ResourceForm() {
  const [state, formAction, pending] = useActionState(createResource, undefined);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-row">
        <label htmlFor="title" className="admin-label">Titolo *</label>
        <input
          id="title"
          name="title"
          required
          placeholder="Es. Libretto festeggiamenti Madonna del Rosario 2026"
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="category" className="admin-label">Categoria *</label>
        <input
          id="category"
          name="category"
          required
          defaultValue="Documenti"
          placeholder="Es. Libretti Madonna del Rosario, Documenti, Moduli…"
          className="admin-input"
        />
        <p className="admin-input-hint">
          Le risorse con la stessa categoria vengono raggruppate nella pagina Risorse.
        </p>
      </div>

      <div className="admin-form-row">
        <label htmlFor="description" className="admin-label">Descrizione</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="file" className="admin-label">File * (PDF o altro documento)</label>
        <input
          id="file"
          name="file"
          type="file"
          required
          style={{ fontSize: 13, color: "var(--ink-soft)" }}
        />
        <p className="admin-input-hint">
          Il file viene caricato su Vercel Blob e reso scaricabile dal sito.
        </p>
      </div>

      {state?.error && (
        <div className="admin-error" style={{ marginBottom: 20 }}>{state.error}</div>
      )}

      <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
        {pending ? "Caricamento…" : "Carica risorsa"}
      </button>
    </form>
  );
}
