"use client";

import { useTransition } from "react";

export default function DeleteButton({
  action,
  label = "Elimina",
  confirmMessage = "Eliminare definitivamente questo elemento?",
}: {
  action: () => Promise<void>;
  label?: string;
  confirmMessage?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(async () => {
            try {
              await action();
            } catch {
              window.alert("Eliminazione non riuscita: riprova.");
            }
          });
        }
      }}
      className="admin-btn-danger-link"
    >
      {pending ? "…" : label}
    </button>
  );
}
