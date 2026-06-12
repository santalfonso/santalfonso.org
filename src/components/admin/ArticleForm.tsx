"use client";

import { useActionState } from "react";
import type { Article } from "@/db/schema";
import type { ActionState } from "@/actions/articles";

const inputClass =
  "w-full rounded border border-stone-300 px-3 py-2 focus:border-amber-600 focus:outline-none";

export default function ArticleForm({
  action,
  article,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  article?: Article;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-3xl space-y-5">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-stone-700">
          Titolo *
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={article?.title}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="mb-1 block text-sm font-medium text-stone-700">
          Sommario (mostrato negli elenchi)
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={article?.excerpt ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="body" className="mb-1 block text-sm font-medium text-stone-700">
          Testo dell&apos;articolo * (puoi usare Markdown: **grassetto**,
          ## titoli, elenchi…)
        </label>
        <textarea
          id="body"
          name="body"
          rows={14}
          required
          defaultValue={article?.body}
          className={`${inputClass} font-mono text-sm`}
        />
      </div>

      <div>
        <label htmlFor="coverImage" className="mb-1 block text-sm font-medium text-stone-700">
          Immagine di copertina {article?.coverImageUrl ? "(sostituisce quella attuale)" : ""}
        </label>
        {article?.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            alt="Copertina attuale"
            className="mb-2 h-32 rounded object-cover"
          />
        )}
        <input
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/*"
          className="block text-sm"
        />
        <p className="mt-1 text-xs text-stone-400">
          L&apos;immagine viene caricata su Cloudinary.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <input
          type="checkbox"
          name="published"
          defaultChecked={article?.published ?? false}
          className="h-4 w-4"
        />
        Pubblicato (visibile sul sito)
      </label>

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
        {pending ? "Salvataggio…" : "Salva articolo"}
      </button>
    </form>
  );
}
