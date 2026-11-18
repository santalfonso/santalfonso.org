"use server";

import { headers } from "next/headers";
import { canSendContactMail, getContactConfig, sendContactMail } from "@/lib/contact-config";
import { contactEmailHtml } from "@/lib/contact-email";
import { isLimited, recordFailure } from "@/lib/rate-limit";

export type ContactState =
  | { ok: true }
  | { ok?: false; error: string; values?: { name: string; email: string; subject: string; message: string } }
  | undefined;

/** Punteggio reCAPTCHA v3 minimo (0 = robot, 1 = persona). */
const MIN_SCORE = 0.5;
const RECAPTCHA_ACTION = "contatti";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 5;

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;

function field(formData: FormData, name: string, max: number): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Chiede a Google il giudizio sul token reCAPTCHA v3 generato dalla pagina. */
async function verifyRecaptcha(secret: string | null, token: string, ip: string): Promise<boolean> {
  if (!secret || !token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") body.set("remoteip", ip);
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean; score?: number; action?: string };
    return data.success === true && data.action === RECAPTCHA_ACTION && (data.score ?? 0) >= MIN_SCORE;
  } catch {
    return false;
  }
}

/**
 * Invio del form contatti a info@santalfonso.org con Resend o la casella SMTP impostati in Configurazioni.
 * Il mittente è sempre la casella del sito; chi scrive finisce nel "Rispondi a".
 */
export async function sendContactAction(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: field(formData, "name", 100),
    email: field(formData, "email", 200),
    subject: field(formData, "subject", 150),
    message: field(formData, "message", 5000),
  };

  // campo nascosto: lo riempiono solo i robot
  if (field(formData, "website", 200)) return { ok: true };

  if (!values.name || !values.email || !values.message) {
    return { error: "Compila nome, email e messaggio.", values };
  }
  if (!EMAIL_RE.test(values.email)) {
    return { error: "L'indirizzo email non sembra corretto.", values };
  }
  if (formData.get("privacy") !== "on") {
    return { error: "Per inviare il messaggio serve il consenso al trattamento dei dati.", values };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim().slice(0, 64);
  const key = `contact:ip:${ip}`;
  if (isLimited(key, MAX_PER_IP)) {
    return { error: "Hai inviato troppi messaggi: riprova più tardi o chiama l'ufficio parrocchiale.", values };
  }

  const config = await getContactConfig();
  if (!(await verifyRecaptcha(config.recaptchaSecretKey, field(formData, "recaptcha", 4000), ip))) {
    return { error: "Non siamo riusciti a verificare l'invio: ricarica la pagina e riprova.", values };
  }

  if (!canSendContactMail(config)) {
    console.error("Form contatti: configurazione di invio mancante");
    return { error: "Invio momentaneamente non disponibile: scrivi a info@santalfonso.org o chiama l'ufficio.", values };
  }

  // a capo e tabulazioni fuori dall'oggetto, per non alterare le intestazioni
  const subject = (values.subject || "Messaggio dal sito").replace(/[\r\n\t]+/g, " ");
  try {
    await sendContactMail(config, {
      replyTo: { name: values.name, address: values.email },
      subject: `[Contatti] ${subject}`,
      text: `Nome: ${values.name}\nEmail: ${values.email}\n\n${values.message}\n\n— Inviato dal form contatti di santalfonso.org`,
      html: contactEmailHtml(values),
    });
  } catch (error) {
    console.error("Form contatti: invio non riuscito", error);
    return { error: "Invio non riuscito per un problema momentaneo: riprova tra poco.", values };
  }

  recordFailure(key, WINDOW_MS);
  return { ok: true };
}
