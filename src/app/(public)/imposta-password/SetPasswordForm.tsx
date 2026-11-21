"use client";

import { useActionState } from "react";
import { setPasswordWithToken } from "@/actions/password-setup";

export default function SetPasswordForm({ token, email, minLength }: { token: string; email: string; minLength: number }) {
  const [state, formAction, pending] = useActionState(setPasswordWithToken, undefined);

  return (
    <form action={formAction} className="ls-stack">
      <input type="hidden" name="t" value={token} />
      {/* per i gestori di password: l'account a cui appartiene la nuova password */}
      <input type="email" name="username" value={email} autoComplete="username" readOnly hidden />
      <div className="ls-field">
        <label htmlFor="sp-password">Nuova password</label>
        <input
          id="sp-password"
          name="password"
          type="password"
          required
          minLength={minLength}
          maxLength={200}
          autoComplete="new-password"
          className="ls-input"
          aria-describedby="sp-hint"
        />
        <span id="sp-hint" className="ls-small ls-muted">
          Almeno {minLength} caratteri.
        </span>
      </div>
      <div className="ls-field">
        <label htmlFor="sp-again">Ripeti la password</label>
        <input
          id="sp-again"
          name="again"
          type="password"
          required
          minLength={minLength}
          maxLength={200}
          autoComplete="new-password"
          className="ls-input"
        />
      </div>
      {state?.error && (
        <p className="ls-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="ls-btn ls-btn--primary ls-btn--block" disabled={pending}>
        {pending ? "Salvataggio…" : "Salva la password ed entra"}
      </button>
    </form>
  );
}
