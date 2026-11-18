"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function DeleteButton({
  action,
  label = "Elimina",
  confirmMessage = "Eliminare definitivamente questo elemento?",
  doneHref,
}: {
  action: () => Promise<void>;
  label?: string;
  confirmMessage?: string;
  /** Pagina da aprire dopo l'eliminazione (quando quella attuale non esiste più). */
  doneHref?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          startTransition(async () => {
            try {
              await action();
              if (doneHref) router.push(doneHref);
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
