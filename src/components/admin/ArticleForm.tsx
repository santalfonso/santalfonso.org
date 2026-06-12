"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import type { Article } from "@/db/schema";
import type { ActionState } from "@/actions/articles";
import { proofreadText, generateTitle, generateExcerpt } from "@/actions/ai";

function SparkleIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.5 2C9.5 2 9 5 7.5 6.5C6 8 3 8.5 3 8.5C3 8.5 6 9 7.5 10.5C9 12 9.5 15 9.5 15C9.5 15 10 12 11.5 10.5C13 9 16 8.5 16 8.5C16 8.5 13 8 11.5 6.5C10 5 9.5 2 9.5 2Z" />
      <path d="M18.5 13C18.5 13 18.2 14.3 17.5 15C16.8 15.7 15.5 16 15.5 16C15.5 16 16.8 16.3 17.5 17C18.2 17.7 18.5 19 18.5 19C18.5 19 18.8 17.7 19.5 17C20.2 16.3 21.5 16 21.5 16C21.5 16 20.2 15.7 19.5 15C18.8 14.3 18.5 13 18.5 13Z" />
    </svg>
  );
}

export default function ArticleForm({
  action,
  article,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  article?: Article;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [aiError, setAiError] = useState<string | null>(null);

  const [aiPending, startAi] = useTransition();
  const [aiTarget, setAiTarget] = useState<"title" | "excerpt" | "body" | null>(null);

  function runAi(
    target: "title" | "excerpt" | "body",
    fn: () => Promise<{ data: string } | { error: string }>,
  ) {
    setAiError(null);
    setAiTarget(target);
    startAi(async () => {
      const result = await fn();
      if ("data" in result) {
        if (target === "title") setTitle(result.data);
        else if (target === "excerpt") setExcerpt(result.data);
        else setBody(result.data);
      } else {
        setAiError(result.error);
      }
      setAiTarget(null);
    });
  }

  const busy = aiPending;

  return (
    <form action={formAction} className="admin-form">
      {/* Titolo */}
      <div className="admin-form-row">
        <div className="admin-field-head">
          <label htmlFor="title" className="admin-label">Titolo *</label>
          <button
            type="button"
            className="admin-btn-ai"
            disabled={busy || !body.trim()}
            title={!body.trim() ? "Scrivi prima il testo dell'articolo" : ""}
            onClick={() => runAi("title", () => generateTitle(body))}
          >
            <SparkleIcon />
            {aiTarget === "title" ? "Generazione…" : "Genera titolo"}
          </button>
        </div>
        <input
          id="title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="admin-input"
        />
      </div>

      {/* Sommario */}
      <div className="admin-form-row">
        <div className="admin-field-head">
          <label htmlFor="excerpt" className="admin-label">
            Sommario (mostrato negli elenchi)
          </label>
          <button
            type="button"
            className="admin-btn-ai"
            disabled={busy || !body.trim()}
            title={!body.trim() ? "Scrivi prima il testo dell'articolo" : ""}
            onClick={() => runAi("excerpt", () => generateExcerpt(body))}
          >
            <SparkleIcon />
            {aiTarget === "excerpt" ? "Generazione…" : "Genera sommario"}
          </button>
        </div>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="admin-input"
        />
      </div>

      {/* Testo articolo */}
      <div className="admin-form-row">
        <div className="admin-field-head">
          <label htmlFor="body" className="admin-label">
            Testo dell&apos;articolo * — supporta Markdown: **grassetto**, ## titoli, elenchi…
          </label>
          <button
            type="button"
            className="admin-btn-ai"
            disabled={busy || !body.trim()}
            onClick={() => runAi("body", () => proofreadText(body))}
          >
            <SparkleIcon />
            {aiTarget === "body" ? "Correzione…" : "Correggi testo"}
          </button>
        </div>
        <textarea
          id="body"
          name="body"
          rows={16}
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="admin-input mono"
        />
      </div>

      {aiError && (
        <div className="admin-ai-feedback error" style={{ marginBottom: 16 }}>
          {aiError}
        </div>
      )}

      {/* Immagine di copertina */}
      <div className="admin-form-row">
        <label htmlFor="coverImage" className="admin-label">
          Immagine di copertina
          {article?.coverImageUrl ? " (sostituisce quella attuale)" : ""}
        </label>
        {article?.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            alt="Copertina attuale"
            className="admin-img-preview"
          />
        )}
        <input
          id="coverImage"
          name="coverImage"
          type="file"
          accept="image/*"
          style={{ fontSize: 13, color: "var(--ink-soft)" }}
        />
        <p className="admin-input-hint">
          L&apos;immagine viene caricata su Cloudinary.
        </p>
      </div>

      {/* Pubblicato */}
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
        <div className="admin-error" style={{ marginBottom: 20 }}>
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="admin-btn admin-btn-primary"
      >
        {pending ? "Salvataggio…" : "Salva articolo"}
      </button>
    </form>
  );
}
