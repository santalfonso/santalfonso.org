"use client";

import { useActionState } from "react";
import { runUpdatesCheck } from "@/actions/updates";

export default function UpdatesCheckButton() {
  const [state, action, pending] = useActionState(runUpdatesCheck, undefined);
  return (
    <form action={action} className="upd-check">
      <button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
        {pending ? (
          <>
            <span className="admin-spinner" /> Verifica in corso…
          </>
        ) : (
          "Verifica aggiornamenti"
        )}
      </button>
      {state?.error && <p className="admin-error" style={{ margin: 0 }}>{state.error}</p>}
    </form>
  );
}
