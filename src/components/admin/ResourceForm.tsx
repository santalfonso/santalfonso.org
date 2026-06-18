"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/actions/articles";
import { createResource } from "@/actions/resources";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";

export default function ResourceForm() {
  const [state, formAction, pending] = useActionState(createResource, undefined);

  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setUploadedUrl(null);
    setUploadError(null);
    setUploading(true);

    try {
      const url = await uploadToCloudinary(file, "santalfonso/risorse", "raw");
      setUploadedUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload non riuscito");
    } finally {
      setUploading(false);
    }
  }

  const busy = pending || uploading;

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
        <textarea id="description" name="description" rows={3} className="admin-input" />
      </div>

      <div className="admin-form-row">
        <label htmlFor="file-picker" className="admin-label">
          File * (PDF o altro documento)
        </label>
        <input
          id="file-picker"
          type="file"
          required={!uploadedUrl}
          onChange={handleFile}
          style={{ fontSize: 13, color: "var(--ink-soft)" }}
        />

        {uploading && (
          <p style={{ marginTop: 8, fontSize: 13, color: "var(--ink-mute)", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="admin-spinner" />
            Caricamento in corso…
          </p>
        )}

        {uploadedUrl && !uploading && (
          <p style={{ marginTop: 6, fontSize: 12, color: "var(--azure-deep)" }}>
            ✓ File caricato: {fileName}
          </p>
        )}

        {uploadError && (
          <p style={{ marginTop: 6, fontSize: 12, color: "#e53" }}>
            Errore: {uploadError}
          </p>
        )}

        <p className="admin-input-hint">
          Il file viene caricato su Cloudinary e reso scaricabile tramite il sito.
        </p>
      </div>

      {/* Campi nascosti letti dalla Server Action */}
      <input type="hidden" name="fileUrl" value={uploadedUrl ?? ""} />
      <input type="hidden" name="fileName" value={fileName ?? ""} />
      <input type="hidden" name="fileSize" value={fileSize ?? ""} />

      {state?.error && (
        <div className="admin-error" style={{ marginBottom: 20 }}>{state.error}</div>
      )}

      <button type="submit" disabled={busy || !uploadedUrl} className="admin-btn admin-btn-primary">
        {uploading ? "Caricamento file…" : pending ? "Salvataggio…" : "Carica risorsa"}
      </button>
    </form>
  );
}
