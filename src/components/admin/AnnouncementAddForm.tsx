"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAnnouncement } from "@/actions/announcements";

export default function AnnouncementAddForm() {
  const [state, formAction, pending] = useActionState(createAnnouncement, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state && formRef.current) formRef.current.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <input
        name="text"
        required
        placeholder="Testo dell'avviso…"
        className="admin-input"
        style={{ flex: 1, minWidth: 260 }}
      />
      <button type="submit" disabled={pending} className="admin-btn admin-btn-dark" style={{ flexShrink: 0 }}>
        {pending ? "Aggiunta…" : "+ Aggiungi avviso"}
      </button>
      {state?.error && (
        <p className="admin-error" style={{ width: "100%", margin: 0 }}>{state.error}</p>
      )}
    </form>
  );
}
