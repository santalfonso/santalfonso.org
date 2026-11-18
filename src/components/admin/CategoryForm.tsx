"use client";

import { startTransition, useActionState, useState } from "react";
import type { ResourceFormState } from "@/actions/resources";
import type { ResourceCategory } from "@/db/schema";
import ImageDropzone from "./ImageDropzone";

/** Nome, descrizione e foto di una categoria della pagina Risorse. */
export default function CategoryForm({
  action,
  category,
}: {
  action: (prev: ResourceFormState, formData: FormData) => Promise<ResourceFormState>;
  category?: ResourceCategory;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [uploading, setUploading] = useState(false);
  // invio senza il reset automatico di React 19: dopo un errore i campi restano compilati
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => formAction(data));
  };

  return (
    <form onSubmit={submit} className="admin-form">
      <div className="admin-form-row">
        <label htmlFor="cat-name" className="admin-label">Nome *</label>
        <input
          id="cat-name"
          name="name"
          required
          maxLength={120}
          defaultValue={category?.name}
          placeholder="Es. Archivio libretti"
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="cat-description" className="admin-label">Sottotitolo</label>
        <input
          id="cat-description"
          name="description"
          maxLength={500}
          defaultValue={category?.description ?? ""}
          placeholder="Es. Festeggiamenti in onore della Madonna del Rosario"
          className="admin-input"
        />
        <p className="admin-input-hint">Compare sotto il nome, nella pagina Risorse.</p>
      </div>

      <div className="admin-form-row">
        <ImageDropzone
          name="image"
          currentUrl={category?.imageUrl}
          label={category ? "Foto" : "Foto *"}
          focusInputName="imageFocus"
          currentFocus={category?.imageFocus}
          onUploadingChange={setUploading}
        />
      </div>

      {state?.error && <div className="admin-error" style={{ marginBottom: 20 }}>{state.error}</div>}
      {state?.success && !pending && <div className="admin-success" style={{ marginBottom: 20 }}>Categoria salvata.</div>}

      <button type="submit" disabled={pending || uploading} className="admin-btn admin-btn-primary">
        {uploading ? "Caricamento foto…" : pending ? "Salvataggio…" : category ? "Salva categoria" : "Crea categoria"}
      </button>
    </form>
  );
}
