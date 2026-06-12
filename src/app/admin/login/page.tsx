"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/actions/login";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-center text-2xl font-bold text-amber-900">
          Area riservata
        </h1>
        <p className="mt-1 text-center text-sm text-stone-500">
          Parrocchia Sant&apos;Alfonso Maria de&apos; Liguori
        </p>
        <form action={formAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded border border-stone-300 px-3 py-2 focus:border-amber-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded border border-stone-300 px-3 py-2 focus:border-amber-600 focus:outline-none"
            />
          </div>
          {state?.error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-amber-800 py-2 font-semibold text-white hover:bg-amber-900 disabled:opacity-50"
          >
            {pending ? "Accesso in corso…" : "Accedi"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-amber-700 hover:underline">
            ← Torna al sito
          </Link>
        </p>
      </div>
    </div>
  );
}
