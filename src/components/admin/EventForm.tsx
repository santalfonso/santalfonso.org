"use client";

import { useActionState, useState, useTransition, startTransition } from "react";
import type { Event } from "@/db/schema";
import type { ActionState } from "@/actions/articles";
import { proofreadEvent, type EventTexts } from "@/actions/ai";
import { capitalizeFirst, isoToRomeLocal } from "@/lib/utils";
import ImageDropzone from "./ImageDropzone";
import SparkleIcon from "./SparkleIcon";

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

  // testi controllati: l'AI li può correggere e l'iniziale diventa maiuscola uscendo dal campo
  const [texts, setTexts] = useState<EventTexts>({
    title: event?.title ?? "",
    location: event?.location ?? "",
    description: event?.description ?? "",
  });
  const setText = (key: keyof EventTexts) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setTexts((t) => ({ ...t, [key]: e.target.value }));
  const capitalize = (key: keyof EventTexts) => () => setTexts((t) => ({ ...t, [key]: capitalizeFirst(t[key]) }));

  const [aiPending, startAi] = useTransition();
  const [aiMessage, setAiMessage] = useState<{ error?: string; info?: string } | null>(null);
  const [beforeAi, setBeforeAi] = useState<EventTexts | null>(null);
  function runAi() {
    setAiMessage(null);
    startAi(async () => {
      const result = await proofreadEvent(texts);
      if ("error" in result) {
        setAiMessage({ error: result.error });
        return;
      }
      const changed = (Object.keys(texts) as (keyof EventTexts)[]).filter((k) => result.data[k] !== texts[k]);
      if (changed.length === 0) {
        setAiMessage({ info: "Nessuna correzione necessaria." });
        return;
      }
      const names = { title: "titolo", location: "luogo", description: "descrizione" };
      setBeforeAi(texts);
      setTexts(result.data);
      setAiMessage({ info: `Corretti: ${changed.map((k) => names[k]).join(", ")}.` });
    });
  }
  function undoAi() {
    if (beforeAi) setTexts(beforeAi);
    setBeforeAi(null);
    setAiMessage(null);
  }

  return (
    <form onSubmit={submit} className="admin-form">
      <div className="admin-form-row">
        <div className="admin-field-head">
          <label htmlFor="title" className="admin-label">Titolo *</label>
          <button
            type="button"
            className="admin-btn-ai"
            disabled={aiPending || (!texts.title.trim() && !texts.description.trim())}
            title="Corregge ortografia e maiuscole di titolo, luogo e descrizione"
            onClick={runAi}
          >
            <SparkleIcon />
            {aiPending ? "Correzione…" : "Correggi con AI"}
          </button>
        </div>
        <input
          id="title"
          name="title"
          required
          value={texts.title}
          onChange={setText("title")}
          onBlur={capitalize("title")}
          className="admin-input"
        />
        {aiMessage && (
          <div className={`admin-ai-feedback${aiMessage.error ? " error" : ""}`}>
            {aiMessage.error ?? aiMessage.info}
            {beforeAi && !aiMessage.error && (
              <button type="button" className="admin-btn-link" style={{ marginLeft: 10 }} onClick={undoAi}>
                Annulla
              </button>
            )}
          </div>
        )}
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
          value={texts.location}
          onChange={setText("location")}
          onBlur={capitalize("location")}
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
          value={texts.description}
          onChange={setText("description")}
          onBlur={capitalize("description")}
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
