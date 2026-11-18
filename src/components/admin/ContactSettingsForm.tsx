"use client";

import { useActionState } from "react";
import {
  saveContactSettings,
  sendContactTestEmail,
  type ContactSettingsState,
} from "@/actions/contact-settings";

type Props = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  hasSmtpPassword: boolean;
  recaptchaSiteKey: string;
  hasRecaptchaSecret: boolean;
  hasResendKey: boolean;
};

const headingStyle = {
  fontSize: 16,
  fontWeight: 700,
  color: "var(--ink)",
  margin: "0 0 6px",
  letterSpacing: "-0.01em",
} as const;
const leadStyle = { fontSize: 13, color: "var(--ink-mute)", margin: "0 0 20px", lineHeight: 1.5 } as const;
const monoStyle = { fontFamily: "var(--mono)" } as const;

/** Configurazione del form contatti: invio (Resend o casella SMTP) e chiavi Google reCAPTCHA v3. */
export default function ContactSettingsForm(props: Props) {
  const [state, formAction, pending] = useActionState<ContactSettingsState, FormData>(
    saveContactSettings,
    undefined,
  );
  const [testState, testAction, testing] = useActionState<ContactSettingsState, FormData>(
    () => sendContactTestEmail(),
    undefined,
  );

  return (
    <div style={{ maxWidth: 640, marginTop: 24 }}>
      <div className="admin-card">
        <div className="admin-card-body">
          <h2 style={headingStyle}>Form contatti</h2>
          <p style={leadStyle}>
            I messaggi della pagina Contatti arrivano a <strong>info@santalfonso.org</strong>. Se c&apos;è la chiave
            Resend si usa Resend, altrimenti la casella SMTP. Chiavi e password vengono salvate cifrate; lascia vuoti
            quei campi per mantenere i valori già salvati.
          </p>

          <form action={formAction}>
            <h3 style={{ ...headingStyle, fontSize: 14 }}>Resend (consigliato)</h3>
            <p style={{ ...leadStyle, marginBottom: 14 }}>
              Aruba rifiuta le connessioni SMTP dai server di Vercel: con Resend l&apos;invio passa da HTTPS. Chiave da{" "}
              <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: "var(--azure-deep)", textDecoration: "underline" }}>
                resend.com/api-keys
              </a>
              ; il dominio santalfonso.org deve essere verificato su Resend.
            </p>
            <div className="admin-form-row">
              <label htmlFor="resend-key" className="admin-label">
                {props.hasResendKey ? "Nuova chiave API (✓ già salvata)" : "Chiave API Resend"}
              </label>
              <input id="resend-key" name="resend_api_key" type="password" autoComplete="off" placeholder="re_…" className="admin-input" style={monoStyle} />
            </div>

            <h3 style={{ ...headingStyle, fontSize: 14, marginTop: 8 }}>Casella SMTP (alternativa)</h3>
            <div className="admin-grid-2">
              <div className="admin-form-row">
                <label htmlFor="smtp-host" className="admin-label">Server SMTP *</label>
                <input id="smtp-host" name="smtp_host" required defaultValue={props.smtpHost} placeholder="smtps.aruba.it" className="admin-input" style={monoStyle} />
              </div>
              <div className="admin-form-row">
                <label htmlFor="smtp-port" className="admin-label">Porta</label>
                <input id="smtp-port" name="smtp_port" inputMode="numeric" defaultValue={props.smtpPort} placeholder="465" className="admin-input" style={monoStyle} />
              </div>
            </div>
            <div className="admin-form-row">
              <label htmlFor="smtp-user" className="admin-label">Utente (indirizzo della casella) *</label>
              <input id="smtp-user" name="smtp_user" type="email" required defaultValue={props.smtpUser} placeholder="info@santalfonso.org" autoComplete="off" className="admin-input" style={monoStyle} />
            </div>
            <div className="admin-form-row">
              <label htmlFor="smtp-password" className="admin-label">
                {props.hasSmtpPassword ? "Nuova password (✓ già salvata)" : "Password"}
              </label>
              <input id="smtp-password" name="smtp_password" type="password" autoComplete="new-password" className="admin-input" style={monoStyle} />
            </div>

            <h3 style={{ ...headingStyle, fontSize: 14, marginTop: 8 }}>Google reCAPTCHA v3</h3>
            <p style={{ ...leadStyle, marginBottom: 14 }}>
              Chiavi da{" "}
              <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" style={{ color: "var(--azure-deep)", textDecoration: "underline" }}>
                google.com/recaptcha/admin
              </a>
              .
            </p>
            <div className="admin-form-row">
              <label htmlFor="recaptcha-site" className="admin-label">Chiave del sito</label>
              <input id="recaptcha-site" name="recaptcha_site_key" defaultValue={props.recaptchaSiteKey} placeholder="6L…" autoComplete="off" className="admin-input" style={monoStyle} />
            </div>
            <div className="admin-form-row">
              <label htmlFor="recaptcha-secret" className="admin-label">
                {props.hasRecaptchaSecret ? "Nuova chiave segreta (✓ già salvata)" : "Chiave segreta"}
              </label>
              <input id="recaptcha-secret" name="recaptcha_secret_key" type="password" autoComplete="off" placeholder="6L…" className="admin-input" style={monoStyle} />
            </div>

            {state?.error && <div className="admin-error" style={{ marginBottom: 16 }}>{state.error}</div>}
            {state?.success && <div className="admin-success" style={{ marginBottom: 16 }}>{state.success}</div>}

            <button type="submit" disabled={pending} className="admin-btn admin-btn-primary">
              {pending ? "Salvataggio…" : "Salva impostazioni"}
            </button>
          </form>

          <form action={testAction} style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--rule)" }}>
            <p style={{ ...leadStyle, marginBottom: 12 }}>
              Dopo aver salvato, invia un&apos;email di prova a info@santalfonso.org per controllare l&apos;invio.
            </p>
            {testState?.error && <div className="admin-error" style={{ marginBottom: 16 }}>{testState.error}</div>}
            {testState?.success && <div className="admin-success" style={{ marginBottom: 16 }}>{testState.success}</div>}
            <button type="submit" disabled={testing} className="admin-btn admin-btn-ghost">
              {testing ? "Invio in corso…" : "Invia email di prova"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
