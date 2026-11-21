"use client";

import Script from "next/script";
import { useActionState, useRef, useState } from "react";
import { requestAccountAction, type AccountRequestState } from "@/actions/account-request";
import { recaptchaScriptSrc, recaptchaToken } from "@/lib/recaptcha-client";

/** Pulsante "Richiedi un account" che apre un piccolo form: la richiesta arriva all'amministratore. */
export default function AccountRequest({ siteKey }: { siteKey: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<AccountRequestState, FormData>(requestAccountAction, undefined);
  const [preparing, setPreparing] = useState(false);
  const tokenRef = useRef<HTMLInputElement>(null);
  const readyRef = useRef(false);
  const values = state && !state.ok ? state.values : undefined;

  if (state?.ok) {
    return (
      <div className="ls-note ls-account-request__done" role="status">
        <strong>Richiesta inviata.</strong> L&apos;amministratore del sito ti risponderà all&apos;email che hai
        indicato.
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="ls-btn ls-btn--block" onClick={() => setOpen(true)} aria-expanded="false">
        Richiedi un account
      </button>
    );
  }

  return (
    <>
      {/* lo script anti-spam si carica solo quando il form viene aperto */}
      {siteKey && <Script src={recaptchaScriptSrc(siteKey)} strategy="afterInteractive" />}
      <form
        className="ls-stack ls-account-request"
        aria-labelledby="ar-title"
        action={formAction}
        onSubmit={async (e) => {
          // il token si genera al momento dell'invio, poi il form parte con l'azione server
          if (readyRef.current) return;
          e.preventDefault();
          const form = e.currentTarget;
          setPreparing(true);
          const token = await recaptchaToken(siteKey ?? "", "richiesta_account");
          setPreparing(false);
          if (tokenRef.current) tokenRef.current.value = token;
          readyRef.current = true;
          form.requestSubmit();
          readyRef.current = false;
        }}
      >
        <h2 id="ar-title" className="ls-account-request__title">
          Richiedi un account
        </h2>
        <div className="ls-field">
          <label htmlFor="ar-name">Nome e cognome</label>
          <input
            id="ar-name"
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className="ls-input"
            defaultValue={values?.name}
            autoFocus
          />
        </div>
        <div className="ls-field">
          <label htmlFor="ar-email">Email</label>
          <input
            id="ar-email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className="ls-input"
            defaultValue={values?.email}
          />
        </div>
        <div className="ls-field">
          <label htmlFor="ar-message">
            Messaggio <span className="ls-muted ls-small">(facoltativo)</span>
          </label>
          <textarea
            id="ar-message"
            name="message"
            rows={3}
            maxLength={2000}
            className="ls-textarea"
            placeholder="Per esempio: faccio parte del coro della Messa delle 10:30"
            defaultValue={values?.message}
          />
        </div>
        {/* campo nascosto: lo riempiono solo i robot */}
        <div className="ls-account-request__hp" aria-hidden="true">
          <label htmlFor="ar-website">Sito web</label>
          <input id="ar-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <input ref={tokenRef} type="hidden" name="recaptcha" />
        {state && !state.ok && (
          <p className="ls-error" role="alert">
            {state.error}
          </p>
        )}
        <div className="ls-account-request__actions">
          <button type="button" className="ls-btn" onClick={() => setOpen(false)} disabled={pending || preparing}>
            Annulla
          </button>
          <button type="submit" className="ls-btn ls-btn--primary" disabled={pending || preparing}>
            {pending || preparing ? "Invio in corso…" : "Invia la richiesta"}
          </button>
        </div>
        <p className="ls-small ls-muted">
          I dati servono solo a creare l&apos;account e arrivano per email all&apos;amministratore del sito.
        </p>
      </form>
    </>
  );
}
