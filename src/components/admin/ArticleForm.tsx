"use client";

import { useState, useTransition, startTransition } from "react";
import { useActionState } from "react";
import type { Article, ArticleImage } from "@/db/schema";
import { isoToRomeLocal } from "@/lib/utils";
import ImageDropzone from "./ImageDropzone";
import GalleryEditor from "./GalleryEditor";
import RichTextEditor from "./RichTextEditor";
import type { ActionState } from "@/actions/articles";
import { proofreadText, generateTitle, generateExcerpt } from "@/actions/ai";
import SparkleIcon from "./SparkleIcon";


export default function ArticleForm({
  action,
  article,
  galleryImages = [],
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  article?: Article;
  galleryImages?: ArticleImage[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // invio senza il reset automatico di React 19: dopo un errore i campi restano compilati
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => formAction(data));
  };

  const [title, setTitle] = useState(article?.title ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [aiError, setAiError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [aiPending, startAi] = useTransition();
  const [aiTarget, setAiTarget] = useState<"title" | "excerpt" | "body" | null>(null);

  function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  function textToHtml(text: string) {
    const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return text
      .split(/\n\n+/)
      .map((p) => `<p>${escape(p.trim()).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  /** Testo corretto dall'AI: di solito HTML con la formattazione originale, altrimenti testo semplice. */
  function correctedBody(result: string) {
    const clean = result.replace(/^\s*```(?:html)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
    return /<(p|h[1-6]|ul|ol|li|blockquote|br|strong|em|a)\b/i.test(clean) ? clean : textToHtml(clean);
  }

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
        else setBody(correctedBody(result.data));
      } else {
        setAiError(result.error);
      }
      setAiTarget(null);
    });
  }

  const busy = aiPending;
  const uploading = coverUploading || galleryUploading;

  return (
    <form onSubmit={submit} className="admin-form">
      {/* Titolo */}
      <div className="admin-form-row">
        <div className="admin-field-head">
          <label htmlFor="title" className="admin-label">Titolo *</label>
          <button
            type="button"
            className="admin-btn-ai"
            disabled={busy || !body.trim()}
            title={!body.trim() ? "Scrivi prima il testo dell'articolo" : ""}
            onClick={() => runAi("title", () => generateTitle(stripHtml(body)))}
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
            onClick={() => runAi("excerpt", () => generateExcerpt(stripHtml(body)))}
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
          <label className="admin-label">
            Testo dell&apos;articolo *
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
        <RichTextEditor
          name="body"
          value={body}
          onChange={setBody}
          required
        />
      </div>

      {aiError && (
        <div className="admin-ai-feedback error" style={{ marginBottom: 16 }}>
          {aiError}
        </div>
      )}

      <ImageDropzone
        name="coverImage"
        currentUrl={article?.coverImageUrl}
        label="Immagine di copertina"
        focusInputName="coverImageFocus"
        currentFocus={article?.coverImageFocus}
        onUploadingChange={setCoverUploading}
      />

      <GalleryEditor
        existing={galleryImages.map((img) => ({ id: img.id, url: img.url }))}
        onUploadingChange={setGalleryUploading}
      />

      {/* Data di pubblicazione */}
      <div className="admin-form-row">
        <label htmlFor="publishedAt" className="admin-label">
          Data di pubblicazione
        </label>
        <input
          type="date"
          id="publishedAt"
          name="publishedAt"
          defaultValue={
            // giorno di Roma (il server gira in UTC: vicino a mezzanotte sarebbe il giorno sbagliato)
            isoToRomeLocal(article?.publishedAt ?? new Date().toISOString()).slice(0, 10)
          }
          className="admin-input"
          style={{ maxWidth: 220 }}
        />
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
        disabled={pending || uploading}
        className="admin-btn admin-btn-primary"
      >
        {uploading ? "Caricamento foto…" : pending ? "Salvataggio…" : "Salva articolo"}
      </button>
    </form>
  );
}
