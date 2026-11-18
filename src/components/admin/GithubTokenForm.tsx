"use client";

import { useActionState } from "react";
import { saveSetting, type SettingState } from "@/actions/settings";

/** Token GitHub per il pulsante "Applica aggiornamenti" (Impostazioni → Aggiornamenti). */
export default function GithubTokenForm({ hasToken, repo }: { hasToken: boolean; repo: string }) {
  const [state, formAction, pending] = useActionState<SettingState, FormData>(saveSetting, undefined);

  return (
    <div style={{ maxWidth: 640, marginTop: 24 }}>
      <div className="admin-card">
        <div className="admin-card-body">
          <h2 className="cfg-title">GitHub · aggiornamenti automatici</h2>
          <p className="cfg-text">
            Serve al pulsante &ldquo;Applica aggiornamenti&rdquo; nella pagina Aggiornamenti. Crea un{" "}
            <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">
              fine-grained token
            </a>{" "}
            con:
          </p>
          <ul className="cfg-list">
            <li>
              <strong>Repository access</strong>: <em>Only select repositories</em> → <code>{repo}</code>
            </li>
            <li>
              <strong>Permissions</strong> → <strong>Actions</strong>: <em>Read and write</em> (nient&apos;altro)
            </li>
            <li>
              <strong>Expiration</strong>: a scelta (alla scadenza basta crearne uno nuovo e incollarlo qui)
            </li>
          </ul>

          {hasToken && (
            <p className="cfg-ok">
              <span aria-hidden="true">✓</span> Token configurato. Inserisci un nuovo valore per sostituirlo.
            </p>
          )}

          <form action={formAction}>
            <input type="hidden" name="key" value="github_token" />
            <div className="admin-form-row">
              <label htmlFor="github-token" className="admin-label">
                {hasToken ? "Nuovo token" : "Token *"}
              </label>
              <input
                id="github-token"
                name="value"
                type="password"
                autoComplete="off"
                placeholder="github_pat_…"
                className="admin-input"
                style={{ fontFamily: "var(--mono)" }}
              />
            </div>
            {state?.error && <div className="admin-error" style={{ marginBottom: 16 }}>{state.error}</div>}
            {state?.success && (
              <div className="admin-success" style={{ marginBottom: 16 }}>
                Token verificato con GitHub e salvato.
              </div>
            )}
            <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
              {pending ? "Verifica in corso…" : "Verifica e salva token"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
