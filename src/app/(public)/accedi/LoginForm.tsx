"use client";

import { useActionState } from "react";
import { loginSiteAction } from "@/actions/account";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginSiteAction, undefined);

  return (
    <form action={formAction} className="ls-stack" noValidate={false}>
      <input type="hidden" name="next" value={next} />
      <div className="ls-field">
        <label htmlFor="ls-email">Email</label>
        <input id="ls-email" name="email" type="email" required autoComplete="email" className="ls-input" />
      </div>
      <div className="ls-field">
        <label htmlFor="ls-password">Password</label>
        <input
          id="ls-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="ls-input"
        />
      </div>
      {state?.error && (
        <p className="ls-error" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" className="ls-btn ls-btn--primary ls-btn--block" disabled={pending}>
        {pending ? "Accesso in corso…" : "Accedi"}
      </button>
    </form>
  );
}
