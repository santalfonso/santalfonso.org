"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/actions/account";

/** Cambio della propria password dall'area personale. */
export default function ChangePasswordForm({ minLength }: { minLength: number }) {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);

  return (
    <form action={formAction} className="ls-card ls-stack" aria-labelledby="cambia-password">
      <h2 id="cambia-password" style={{ margin: 0, fontSize: 20 }}>
        Cambia password
      </h2>
      <div className="ls-field">
        <label htmlFor="pw-current">
          Password attuale
        </label>
        <input id="pw-current" name="current" type="password" autoComplete="current-password" required className="ls-input" />
      </div>
      <div className="ls-field">
        <label htmlFor="pw-new">
          Nuova password <span className="ls-muted">(almeno {minLength} caratteri)</span>
        </label>
        <input
          id="pw-new"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={minLength}
          maxLength={200}
          className="ls-input"
        />
      </div>
      <div className="ls-field">
        <label htmlFor="pw-again">
          Ripeti la nuova password
        </label>
        <input
          id="pw-again"
          name="again"
          type="password"
          autoComplete="new-password"
          required
          minLength={minLength}
          maxLength={200}
          className="ls-input"
        />
      </div>
      {state?.error && (
        <p className="ls-error" role="alert">
          {state.error}
        </p>
      )}
      <p className="ls-small ls-muted" style={{ margin: 0 }}>
        Dopo il cambio, gli altri dispositivi dove hai fatto l&apos;accesso escono da soli entro un minuto.
      </p>
      <div className="ls-row">
        <button type="submit" className="ls-btn ls-btn--primary" disabled={pending}>
          {pending ? "Salvataggio…" : "Cambia password"}
        </button>
      </div>
    </form>
  );
}
