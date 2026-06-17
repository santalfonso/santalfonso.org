"use client";

import { useState, useTransition } from "react";
import { createAnnouncement } from "@/actions/announcements";
import { proofreadAnnouncement } from "@/actions/ai";

const TITLE_MAX = 30;
const TEXT_MAX = 300;

type ConfirmState = {
  correctedTitle: string;
  correctedText: string;
  hasChanges: boolean;
};

export default function AnnouncementAddForm() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmitClick() {
    if (!title.trim()) { setError("Il titolo è obbligatorio."); return; }
    if (!text.trim()) { setError("Il testo è obbligatorio."); return; }
    setError(null);

    startTransition(async () => {
      const result = await proofreadAnnouncement(title, text);
      if ("error" in result) {
        // Proofreading fallita: mostra comunque la conferma senza correzioni
        setConfirm({ correctedTitle: title, correctedText: text, hasChanges: false });
      } else {
        setConfirm(result);
      }
    });
  }

  function handleConfirm() {
    if (!confirm) return;
    startTransition(async () => {
      const result = await createAnnouncement(confirm.correctedTitle, confirm.correctedText);
      if (result?.error) {
        setError(result.error);
        setConfirm(null);
      } else {
        setTitle("");
        setText("");
        setConfirm(null);
      }
    });
  }

  return (
    <>
      <div className="admin-form" style={{ maxWidth: 640 }}>
        <div className="admin-form-row">
          <div className="admin-field-head">
            <label htmlFor="ann-title" className="admin-label">Titolo *</label>
            <span style={{ fontSize: 12, color: title.length > TITLE_MAX ? "#DC2626" : "var(--ink-mute)" }}>
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            id="ann-title"
            name="title"
            required
            maxLength={TITLE_MAX}
            placeholder="Es. Chiusura ufficio parrocchiale"
            className="admin-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="admin-form-row">
          <div className="admin-field-head">
            <label htmlFor="ann-text" className="admin-label">Testo *</label>
            <span style={{ fontSize: 12, color: text.length > TEXT_MAX ? "#DC2626" : "var(--ink-mute)" }}>
              {text.length}/{TEXT_MAX}
            </span>
          </div>
          <textarea
            id="ann-text"
            name="text"
            required
            rows={3}
            maxLength={TEXT_MAX}
            placeholder="Descrizione breve dell'avviso…"
            className="admin-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {error && (
          <div className="admin-error" style={{ marginBottom: 16 }}>{error}</div>
        )}

        <button
          type="button"
          disabled={isPending}
          onClick={handleSubmitClick}
          className="admin-btn admin-btn-dark"
        >
          {isPending && !confirm ? "Controllo ortografia…" : "+ Aggiungi avviso"}
        </button>
      </div>

      {/* Dialog di conferma */}
      {confirm && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 16px",
          }}
        >
          <div style={{
            background: "var(--bg)", borderRadius: "var(--r-lg)",
            padding: "32px 28px", maxWidth: 520, width: "100%",
            boxShadow: "0 16px 60px rgba(0,0,0,0.2)",
          }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>
              Conferma pubblicazione avviso
            </h3>

            {confirm.hasChanges ? (
              <>
                <div style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  background: "color-mix(in oklab, #F59E0B 12%, transparent)",
                  border: "1px solid color-mix(in oklab, #F59E0B 35%, transparent)",
                  borderRadius: 10, padding: "12px 14px", marginBottom: 20, marginTop: 16,
                }}>
                  <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>⚠️</span>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>
                    Sono stati rilevati e corretti alcuni errori ortografici o di punteggiatura.
                    Il testo che verrà pubblicato è il seguente:
                  </p>
                </div>
                <div style={{
                  background: "var(--bg-soft)", borderRadius: 8,
                  padding: "14px 16px", marginBottom: 24,
                }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-mute)" }}>
                    Titolo
                  </p>
                  <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>
                    {confirm.correctedTitle}
                  </p>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--ink-mute)" }}>
                    Testo
                  </p>
                  <p style={{ margin: 0, fontSize: 14, color: "var(--ink)", lineHeight: 1.6 }}>
                    {confirm.correctedText}
                  </p>
                </div>
              </>
            ) : (
              <p style={{ margin: "12px 0 24px", fontSize: 14, color: "var(--ink-mute)", lineHeight: 1.6 }}>
                Il testo è corretto. Confermi la pubblicazione dell&apos;avviso
                {" "}<strong style={{ color: "var(--ink)" }}>&ldquo;{confirm.correctedTitle}&rdquo;</strong>?
              </p>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setConfirm(null)}
                disabled={isPending}
                className="admin-btn"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="admin-btn admin-btn-dark"
              >
                {isPending ? "Pubblicazione…" : "Pubblica avviso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
