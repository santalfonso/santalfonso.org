"use client";

import { startTransition, useActionState } from "react";
import { applyCompatibleUpdates } from "@/actions/updates";

export default function ApplyUpdatesButton({ disabled }: { disabled?: boolean }) {
  const [state, action, pending] = useActionState(applyCompatibleUpdates, undefined);
  return (
    <form
      className="upd-check"
      onSubmit={(e) => {
        e.preventDefault();
        const ok = window.confirm(
          "Applicare tutti gli aggiornamenti compatibili?\n\nIl sito viene prima costruito e verificato: solo se la verifica riesce le modifiche vengono pubblicate. Ci vogliono circa 5–10 minuti.",
        );
        if (ok) startTransition(() => action());
      }}
    >
      <button type="submit" className="admin-btn admin-btn-primary" disabled={disabled || pending}>
        {pending ? (
          <>
            <span className="admin-spinner" /> Avvio…
          </>
        ) : (
          "Applica aggiornamenti"
        )}
      </button>
      {state?.error && <p className="admin-error" style={{ margin: 0 }}>{state.error}</p>}
      {state?.done && !pending && <p className="admin-success" style={{ margin: 0 }}>Avviato: segui l&apos;avanzamento qui sotto.</p>}
    </form>
  );
}
