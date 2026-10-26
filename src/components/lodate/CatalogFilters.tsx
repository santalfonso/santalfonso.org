"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";
import { MOMENTS, SEASONS } from "@/lib/lodate/constants";

/**
 * Ricerca e filtri del catalogo. Funziona anche senza JavaScript (form GET);
 * con JavaScript aggiorna l'URL mentre si scrive e al cambio dei filtri.
 */
export default function CatalogFilters({
  q,
  momento,
  tempo,
}: {
  q: string;
  momento: string;
  tempo: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [pending, startTransition] = useTransition();

  const go = () => {
    const form = formRef.current;
    if (!form) return;
    const params = new URLSearchParams();
    const data = new FormData(form);
    for (const key of ["q", "momento", "tempo"]) {
      const v = String(data.get(key) ?? "").trim();
      if (v) params.set(key, v);
    }
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `/lodate?${qs}` : "/lodate", { scroll: false }));
  };

  const hasFilters = !!(q || momento || tempo);

  return (
    <form
      ref={formRef}
      action="/lodate"
      method="get"
      role="search"
      className="lodate-filters"
      aria-busy={pending}
      onSubmit={(e) => {
        e.preventDefault();
        window.clearTimeout(timer.current);
        go();
      }}
    >
      <div className="lodate-filters__search">
        <label htmlFor="lodate-q" className="lodate-sr">
          Cerca per titolo o testo
        </label>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
        </svg>
        <input
          id="lodate-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Cerca per titolo o parole del testo…"
          autoComplete="off"
          enterKeyHint="search"
          onChange={() => {
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(go, 300);
          }}
        />
      </div>
      <div className="lodate-filters__row">
        <label className="lodate-select">
          <span>Momento</span>
          <select name="momento" defaultValue={momento} onChange={go}>
            <option value="">Tutti i momenti</option>
            {MOMENTS.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="lodate-select">
          <span>Tempo</span>
          <select name="tempo" defaultValue={tempo} onChange={go}>
            <option value="">Tutti i tempi</option>
            {SEASONS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <noscript>
          <button type="submit" className="lodate-btn">
            Cerca
          </button>
        </noscript>
        {hasFilters && (
          <a
            href="/lodate"
            className="lodate-btn lodate-btn--ghost"
            onClick={(e) => {
              e.preventDefault();
              formRef.current?.reset();
              const input = formRef.current?.querySelector<HTMLInputElement>("input[name=q]");
              if (input) input.value = "";
              formRef.current?.querySelectorAll("select").forEach((s) => (s.value = ""));
              startTransition(() => router.replace("/lodate", { scroll: false }));
            }}
          >
            Azzera
          </a>
        )}
      </div>
    </form>
  );
}
