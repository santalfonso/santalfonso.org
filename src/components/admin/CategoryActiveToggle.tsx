"use client";

import { useOptimistic, useTransition } from "react";

/** Interruttore "Visibile nel sito" di una categoria delle Risorse. */
export default function CategoryActiveToggle({
  active,
  name,
  action,
}: {
  active: boolean;
  name: string;
  action: (active: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [shown, setShown] = useOptimistic(active);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={shown}
      aria-label={`Mostra "${name}" nel sito`}
      disabled={pending}
      className={`admin-switch${shown ? " is-on" : ""}`}
      onClick={() =>
        startTransition(async () => {
          setShown(!shown);
          try {
            await action(!shown);
          } catch {
            window.alert("Modifica non riuscita: riprova.");
          }
        })
      }
    >
      <span className="admin-switch__track" aria-hidden="true">
        <span className="admin-switch__thumb" />
      </span>
      <span className="admin-switch__label">{shown ? "Visibile nel sito" : "Nascosta"}</span>
    </button>
  );
}
