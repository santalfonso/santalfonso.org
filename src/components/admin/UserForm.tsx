"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/articles";
import { createUser } from "@/actions/users";

export default function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, undefined);

  return (
    <form action={formAction} className="admin-form admin-form-narrow">
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
          Password * (minimo 8 caratteri)
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
          <option value="editor">Editor — gestisce i contenuti</option>
          <option value="admin">Admin — gestisce contenuti e utenti</option>
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
