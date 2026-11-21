/** reCAPTCHA v3 nel browser: script caricato dalla pagina con la site key. */
type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

/** Chiede un token nuovo per l'azione (scade dopo 2 minuti, quindi uno per invio). */
export function recaptchaToken(siteKey: string, action: string): Promise<string> {
  const g = window.grecaptcha;
  if (!g || !siteKey) return Promise.resolve("");
  return new Promise((resolve) => {
    g.ready(() => {
      g.execute(siteKey, { action }).then(resolve, () => resolve(""));
    });
  });
}

export function recaptchaScriptSrc(siteKey: string): string {
  return `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
}
