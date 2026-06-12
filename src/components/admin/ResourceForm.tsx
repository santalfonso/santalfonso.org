"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/articles";
import { createResource } from "@/actions/resources";

const inputClass =
  "w-full rounded border border-stone-300 px-3 py-2 focus:border-amber-600 focus:outline-none";

export default function ResourceForm() {
  const [state, formAction, pending] = useActionState(createResource, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-stone-700">
          Titolo *
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="Es. Libretto festeggiamenti Madonna del Rosario 2026"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-stone-700">
          Categoria *
        </label>
        <input
          id="category"
          name="category"
          required
          defaultValue="Documenti"
          placeholder="Es. Libretti Madonna del Rosario, Documenti, Moduli…"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-stone-400">
          Le risorse con la stessa categoria vengono raggruppate nella pagina
          Risorse.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-stone-700">
          Descrizione
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="file" className="mb-1 block text-sm font-medium text-stone-700">
          File * (PDF o altro documento)
        </label>
        <input id="file" name="file" type="file" required className="block text-sm" />
        <p className="mt-1 text-xs text-stone-400">
          Il file viene caricato su Vercel Blob e reso scaricabile dal sito.
        </p>
      </div>

      {state?.error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-amber-800 px-6 py-2 font-semibold text-white hover:bg-amber-900 disabled:opacity-50"
      >
        {pending ? "Caricamento…" : "Carica risorsa"}
      </button>
    </form>
  );
}
