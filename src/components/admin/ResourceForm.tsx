"use client";

import { useActionState, useRef, useState, startTransition } from "react";
import type { ResourceFormState } from "@/actions/resources";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";

/** "Libretto_festa_2024_RID.pdf" → "Libretto festa 2024 RID": titolo proposto dal nome del file. */
function titleFromFileName(name: string): string {
  return name.replace(/\.[a-z0-9]{1,5}$/i, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
}

/** Carica un file dentro una categoria; dopo il salvataggio il modulo si svuota per il file successivo. */
export default function ResourceForm({
  action,
}: {
  action: (prev: ResourceFormState, formData: FormData) => Promise<ResourceFormState>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(async (prev: ResourceFormState, data: FormData) => {
    const result = await action(prev, data);
    if (result?.success) {
      setSaved(String(data.get("title") ?? ""));
      formRef.current?.reset();
      setFileName(null);
      setFileSize(null);
      setUploadedUrl(null);
    }
    return result;
  }, undefined);

  // invio senza il reset automatico di React 19: dopo un errore i campi restano compilati
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => formAction(data));
  };

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaved(null);
    setFileName(file.name);
    setFileSize(file.size);
    setUploadedUrl(null);
    setUploadError(null);
    if (titleRef.current && !titleRef.current.value.trim()) titleRef.current.value = titleFromFileName(file.name);
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
    <form ref={formRef} onSubmit={submit} className="admin-form">
      <div className="admin-form-row">
        <label htmlFor="file-picker" className="admin-label">File * (PDF o altro documento)</label>
        <input
          id="file-picker"
          type="file"
          required={!uploadedUrl}
          onChange={handleFile}
          style={{ fontSize: 13, color: "var(--ink-soft)" }}
        />

        {uploading && (
          <p style={{ marginTop: 8, fontSize: 13, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="admin-spinner" />
            Caricamento in corso…
          </p>
        )}
        {uploadedUrl && !uploading && (
          <p style={{ marginTop: 6, fontSize: 12, color: "var(--azure-deep)" }}>✓ File caricato: {fileName}</p>
        )}
        {uploadError && <p className="admin-field-error">Errore: {uploadError}</p>}
      </div>

      <div className="admin-form-row">
        <label htmlFor="res-title" className="admin-label">Titolo *</label>
        <input
          ref={titleRef}
          id="res-title"
          name="title"
          required
          maxLength={200}
          placeholder="Es. Libretto festeggiamenti 2026"
          className="admin-input"
        />
        <p className="admin-input-hint">È il testo del link nella pagina Risorse.</p>
      </div>

      <div className="admin-form-row">
        <label htmlFor="res-description" className="admin-label">Descrizione</label>
        <input id="res-description" name="description" maxLength={2000} className="admin-input" />
      </div>

      {/* Campi nascosti letti dalla Server Action */}
      <input type="hidden" name="fileUrl" value={uploadedUrl ?? ""} />
      <input type="hidden" name="fileName" value={fileName ?? ""} />
      <input type="hidden" name="fileSize" value={fileSize ?? ""} />

      {state?.error && <div className="admin-error" style={{ marginBottom: 20 }}>{state.error}</div>}
      {saved && !busy && <div className="admin-success" style={{ marginBottom: 20 }}>✓ Aggiunto: {saved}</div>}

      <button type="submit" disabled={busy || !uploadedUrl} className="admin-btn admin-btn-primary">
        {uploading ? "Caricamento file…" : pending ? "Salvataggio…" : "Aggiungi file"}
      </button>
    </form>
  );
}
