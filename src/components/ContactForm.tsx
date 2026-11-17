"use client";

import Script from "next/script";
import { useActionState, useRef, useState } from "react";
import { sendContactAction, type ContactState } from "@/actions/contact";

type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

/** Chiede a reCAPTCHA v3 un token nuovo (scade dopo 2 minuti, quindi uno per invio). */
function recaptchaToken(siteKey: string): Promise<string> {
  const g = window.grecaptcha;
  if (!g || !siteKey) return Promise.resolve("");
  return new Promise((resolve) => {
    g.ready(() => {
      g.execute(siteKey, { action: "contatti" }).then(resolve, () => resolve(""));
    });
  });
}

/** Form contatti: il messaggio arriva a info@santalfonso.org. */
export default function ContactForm({ siteKey }: { siteKey: string | null }) {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(sendContactAction, undefined);
  const [preparing, setPreparing] = useState(false);
  const tokenRef = useRef<HTMLInputElement>(null);
  const readyRef = useRef(false);
  const busy = pending || preparing;
  const values = state && !state.ok ? state.values : undefined;

  if (state?.ok) {
    return (
      <div className="card contact-form contact-form--done" role="status">
        <span className="kicker">Messaggio inviato</span>
        <h3 style={{ marginTop: 14, fontSize: 20 }}>Grazie, abbiamo ricevuto il tuo messaggio.</h3>
        <p style={{ margin: "10px 0 0" }}>L&apos;ufficio parrocchiale ti risponderà all&apos;indirizzo email che hai indicato.</p>
      </div>
    );
  }

  return (
    <>
      {siteKey && <Script src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`} strategy="afterInteractive" />}
      <form
        className="card contact-form"
        aria-labelledby="contact-form-title"
        action={formAction}
        onSubmit={async (e) => {
          // il token si genera al momento dell'invio, poi il form parte con l'azione server
          if (readyRef.current) return;
          e.preventDefault();
          const form = e.currentTarget;
          setPreparing(true);
          const token = await recaptchaToken(siteKey ?? "");
          setPreparing(false);
          if (tokenRef.current) tokenRef.current.value = token;
          readyRef.current = true;
          form.requestSubmit();
          readyRef.current = false;
        }}
      >
        <span className="kicker">Scrivici</span>
        <h3 id="contact-form-title" style={{ marginTop: 14, fontSize: 20 }}>
          Invia un messaggio alla parrocchia
        </h3>

        <div className="contact-form__row">
          <div className="contact-form__field">
            <label htmlFor="cf-name">Nome e cognome</label>
            <input id="cf-name" name="name" required maxLength={100} autoComplete="name" defaultValue={values?.name} />
          </div>
          <div className="contact-form__field">
            <label htmlFor="cf-email">Email</label>
            <input id="cf-email" name="email" type="email" required maxLength={200} autoComplete="email" defaultValue={values?.email} />
          </div>
        </div>
        <div className="contact-form__field">
          <label htmlFor="cf-subject">
            Oggetto <span className="contact-form__muted">(facoltativo)</span>
          </label>
          <input id="cf-subject" name="subject" maxLength={150} defaultValue={values?.subject} />
        </div>
        <div className="contact-form__field">
          <label htmlFor="cf-message">Messaggio</label>
          <textarea id="cf-message" name="message" required maxLength={5000} rows={6} defaultValue={values?.message} />
        </div>

        {/* trappola per robot: nascosta a chi usa il sito */}
        <div className="contact-form__trap" aria-hidden="true">
          <label htmlFor="cf-website">Sito web</label>
          <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <input ref={tokenRef} type="hidden" name="recaptcha" />

        <label className="contact-form__check">
          <input type="checkbox" name="privacy" required />
          <span>
            Acconsento al trattamento dei miei dati, usati solo per rispondere a questo messaggio (Reg. UE 2016/679).
          </span>
        </label>

        {state && !state.ok && (
          <p className="contact-form__error" role="alert">
            {state.error}
          </p>
        )}

        <div className="contact-form__actions">
          <button type="submit" className="btn btn--primary" disabled={busy}>
            {busy ? "Invio in corso…" : "Invia messaggio"}
          </button>
          <p className="contact-form__muted contact-form__legal">
            Protetto da reCAPTCHA: si applicano la{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{" "}
            e i{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
              Termini di servizio
            </a>{" "}
            di Google.
          </p>
        </div>
      </form>
    </>
  );
}
