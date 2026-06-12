"use client";

import { useActionState } from "react";
import type { Article } from "@/db/schema";
import type { ActionState } from "@/actions/articles";

export default function ArticleForm({
  action,
  article,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  article?: Article;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-row">
        <label htmlFor="title" className="admin-label">Titolo *</label>
        <input
          id="title"
          name="title"
          required
          defaultValue={article?.title}
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="excerpt" className="admin-label">
          Sommario (mostrato negli elenchi)
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={article?.excerpt ?? ""}
          className="admin-input"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="body" className="admin-label">
          Testo dell&apos;articolo * — supporta Markdown: **grassetto**, ## titoli, elenchi…
        </label>
        <textarea
          id="body"
          name="body"
          rows={16}
          required
          defaultValue={article?.body}
          className="admin-input mono"
        />
      </div>

      <div className="admin-form-row">
        <label htmlFor="coverImage" className="admin-label">
          Immagine di copertina{article?.coverImageUrl ? " (sostituisce quella attuale)" : ""}
        </label>
        {article?.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.coverImageUrl} alt="Copertina attuale" className="admin-img-preview" />
        )}
        <input
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/*"
          style={{ fontSize: 13, color: "var(--ink-soft)" }}
        />
        <p className="admin-input-hint">L&apos;immagine viene caricata su Cloudinary.</p>
      </div>

      <div className="admin-form-row">
        <label className="admin-checkbox-row">
          <input
            type="checkbox"
            name="published"
            defaultChecked={article?.published ?? false}
          />
          Pubblicato (visibile sul sito)
        </label>
      </div>

      {state?.error && (
        <div className="admin-error" style={{ marginBottom: 20 }}>{state.error}</div>
      )}

      <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
        {pending ? "Salvataggio…" : "Salva articolo"}
      </button>
    </form>
  );
}
