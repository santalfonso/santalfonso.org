"use client";

import { useActionState } from "react";
import { saveSetting, type SettingState } from "@/actions/settings";

export default function ConfigurazioniForm({
  hasGroqKey,
}: {
  hasGroqKey: boolean;
}) {
  const [state, formAction, pending] = useActionState<SettingState, FormData>(
    saveSetting,
    undefined,
  );

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="admin-card">
        <div className="admin-card-body">
          <div style={{ marginBottom: 20 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--ink)",
                margin: "0 0 6px",
                letterSpacing: "-0.01em",
              }}
            >
              Groq AI
            </h2>
            <p style={{ fontSize: 13, color: "var(--ink-mute)", margin: 0, lineHeight: 1.5 }}>
              La chiave API Groq abilita le funzioni AI nell&apos;editor degli
              articoli: correzione testo, generazione titolo e sommario.
              Ottieni la tua chiave su{" "}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--azure-deep)", textDecoration: "underline" }}
              >
                console.groq.com
              </a>{" "}
              — è gratuita.
            </p>
          </div>

          {hasGroqKey && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                background: "var(--bg-soft)",
                border: "1px solid var(--rule)",
                borderRadius: "var(--r-sm)",
                marginBottom: 16,
                fontSize: 13,
                color: "var(--ink-soft)",
              }}
            >
              <span style={{ color: "#16A34A", fontSize: 15 }}>✓</span>
              Chiave API configurata. Inserisci un nuovo valore per aggiornarla.
            </div>
          )}

          <form action={formAction}>
            <input type="hidden" name="key" value="groq_api_key" />
            <div className="admin-form-row">
              <label htmlFor="groq-key" className="admin-label">
                {hasGroqKey ? "Nuova chiave API" : "Chiave API *"}
              </label>
              <input
                id="groq-key"
                name="value"
                type="password"
                autoComplete="off"
                placeholder={hasGroqKey ? "gsk_…" : "gsk_…"}
                className="admin-input"
                style={{ fontFamily: "var(--mono)", letterSpacing: "0.05em" }}
              />
            </div>

            {state?.error && (
              <div className="admin-error" style={{ marginBottom: 16 }}>
                {state.error}
              </div>
            )}
            {state?.success && (
              <div className="admin-success" style={{ marginBottom: 16 }}>
                Chiave API salvata correttamente.
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="admin-btn admin-btn-primary"
            >
              {pending ? "Salvataggio…" : "Salva chiave API"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
