"use client";

import { useActionState } from "react";
import type { ActionState } from "@/actions/articles";
import { createUser } from "@/actions/users";

const inputClass =
  "w-full rounded border border-stone-300 px-3 py-2 focus:border-amber-600 focus:outline-none";

export default function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, undefined);

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-stone-700">
          Nome *
        </label>
        <input id="name" name="name" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
          Email *
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
          Password * (minimo 8 caratteri)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-stone-700">
          Ruolo *
        </label>
        <select id="role" name="role" required defaultValue="editor" className={inputClass}>
          <option value="editor">Editor — gestisce i contenuti</option>
          <option value="admin">Admin — gestisce contenuti e utenti</option>
        </select>
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
        {pending ? "Creazione…" : "Crea utente"}
      </button>
    </form>
  );
}
