"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createAnnouncement } from "@/actions/announcements";

const TITLE_MAX = 30;
const TEXT_MAX = 300;

export default function AnnouncementAddForm() {
  const [state, formAction, pending] = useActionState(createAnnouncement, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const [titleLen, setTitleLen] = useState(0);
  const [textLen, setTextLen] = useState(0);

  useEffect(() => {
    if (!state && formRef.current) {
      formRef.current.reset();
      setTitleLen(0);
      setTextLen(0);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="admin-form" style={{ maxWidth: 640 }}>
      <div className="admin-form-row">
        <div className="admin-field-head">
          <label htmlFor="ann-title" className="admin-label">Titolo *</label>
          <span style={{ fontSize: 12, color: titleLen > TITLE_MAX ? "#DC2626" : "var(--ink-mute)" }}>
            {titleLen}/{TITLE_MAX}
          </span>
        </div>
        <input
          id="ann-title"
          name="title"
          required
          maxLength={TITLE_MAX}
          placeholder="Es. Chiusura ufficio parrocchiale"
          className="admin-input"
          onChange={(e) => setTitleLen(e.target.value.length)}
        />
      </div>

      <div className="admin-form-row">
        <div className="admin-field-head">
          <label htmlFor="ann-text" className="admin-label">Testo *</label>
          <span style={{ fontSize: 12, color: textLen > TEXT_MAX ? "#DC2626" : "var(--ink-mute)" }}>
            {textLen}/{TEXT_MAX}
          </span>
        </div>
        <textarea
          id="ann-text"
          name="text"
          required
          rows={3}
          maxLength={TEXT_MAX}
          placeholder="Descrizione breve dell'avviso…"
          className="admin-input"
          onChange={(e) => setTextLen(e.target.value.length)}
        />
      </div>

      {state?.error && (
        <div className="admin-error" style={{ marginBottom: 16 }}>{state.error}</div>
      )}

      <button type="submit" disabled={pending} className="admin-btn admin-btn-dark">
        {pending ? "Aggiunta…" : "+ Aggiungi avviso"}
      </button>
    </form>
  );
}
