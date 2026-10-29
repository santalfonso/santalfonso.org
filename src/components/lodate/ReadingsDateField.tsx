"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

/**
 * Campo data delle letture: scegliendo un giorno la pagina si aggiorna da sola.
 * La pagina lo rimonta a ogni cambio di data (key), così segue anche le frecce.
 */
export default function ReadingsDateField({ date }: { date: string }) {
  const router = useRouter();
  const [value, setValue] = useState(date);
  const [pending, startTransition] = useTransition();
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function onChange(next: string) {
    setValue(next);
    window.clearTimeout(timer.current);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(next) || next === date) return;
    // breve attesa: su iPhone la rotella cambia la data mentre gira
    timer.current = window.setTimeout(() => {
      startTransition(() => router.push(`/lodate/letture?data=${next}`));
    }, 350);
  }

  return (
    <>
      <label htmlFor="ls-data" className="ls-sr">
        Scegli la data
      </label>
      <input
        id="ls-data"
        type="date"
        className="ls-input"
        value={value}
        required
        aria-busy={pending}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  );
}
