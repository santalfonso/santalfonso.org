"use client";

import { useActionState, startTransition } from "react";
import { createUser } from "@/actions/users";

export default function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, undefined);
  // invio senza il reset automatico di React 19: dopo un errore i campi restano compilati
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => formAction(data));
  };

  return (
    <form onSubmit={submit} className="admin-form admin-form-narrow">
      <div className="admin-form-row">
        <label htmlFor="name" className="admin-label">Nome *</label>
        <input id="name" name="name" required className="admin-input" />
      </div>

      <div className="admin-form-row">
        <label htmlFor="email" className="admin-label">Email *</label>
        <input id="email" name="email" type="email" required className="admin-input" />
      </div>

      <div className="admin-form-row">
        <label htmlFor="password" className="admin-label">
          Password * (almeno 12 caratteri per un editor, 8 per un user)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="role" className="admin-label">Ruolo *</label>
        <select id="role" name="role" required defaultValue="editor" className="admin-input">
          <option value="editor">Editor — aggiunge avvisi, articoli, eventi e risorse</option>
          <option value="utente">User — usa le funzioni riservate del sito, senza accesso all&apos;amministrazione</option>
        </select>
      </div>

      {state?.error && (
        <div className="admin-error" style={{ marginBottom: 20 }}>{state.error}</div>
      )}

      <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
        {pending ? "Creazione…" : "Crea utente"}
      </button>
    </form>
  );
}
