import { inArray } from "drizzle-orm";
import nodemailer from "nodemailer";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { openSecret } from "@/lib/secret-box";

/**
 * Configurazione del form contatti, modificabile da Admin → Configurazioni.
 * Se un valore non è nel database si usa la variabile d'ambiente omonima.
 * Solo lato server: NON va esportata da un file "use server".
 */
export const CONTACT_KEYS = {
  smtpHost: "smtp_host",
  smtpPort: "smtp_port",
  smtpUser: "smtp_user",
  smtpPassword: "smtp_password",
  recaptchaSiteKey: "recaptcha_site_key",
  recaptchaSecretKey: "recaptcha_secret_key",
  resendApiKey: "resend_api_key",
} as const;

export type ContactConfig = {
  smtpHost: string | null;
  smtpPort: number;
  smtpUser: string | null;
  smtpPassword: string | null;
  recaptchaSiteKey: string | null;
  recaptchaSecretKey: string | null;
  resendApiKey: string | null;
};

async function readRows(): Promise<Map<string, string>> {
  const rows = await db
    .select({ key: settings.key, value: settings.value })
    .from(settings)
    .where(inArray(settings.key, Object.values(CONTACT_KEYS)));
  return new Map(rows.map((r) => [r.key, r.value]));
}

export async function getContactConfig(): Promise<ContactConfig> {
  const m = await readRows();
  const env = process.env;
  return {
    smtpHost: m.get(CONTACT_KEYS.smtpHost) || env.SMTP_HOST || null,
    smtpPort: Number(m.get(CONTACT_KEYS.smtpPort) || env.SMTP_PORT) || 465,
    smtpUser: m.get(CONTACT_KEYS.smtpUser) || env.SMTP_USER || null,
    smtpPassword: openSecret(m.get(CONTACT_KEYS.smtpPassword) ?? null) || env.SMTP_PASSWORD || null,
    recaptchaSiteKey: m.get(CONTACT_KEYS.recaptchaSiteKey) || env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || null,
    recaptchaSecretKey: openSecret(m.get(CONTACT_KEYS.recaptchaSecretKey) ?? null) || env.RECAPTCHA_SECRET_KEY || null,
    resendApiKey: openSecret(m.get(CONTACT_KEYS.resendApiKey) ?? null) || env.RESEND_API_KEY || null,
  };
}

/** Solo la chiave pubblica del sito, per la pagina Contatti. */
export async function getRecaptchaSiteKey(): Promise<string | null> {
  return (await getContactConfig()).recaptchaSiteKey;
}

/** Indirizzo che riceve i messaggi del form. */
export const CONTACT_TO = "info@santalfonso.org";

/** Mittente dei messaggi del form (con Resend il dominio santalfonso.org deve essere verificato). */
const CONTACT_FROM = { name: "Sito santalfonso.org", address: "info@santalfonso.org" };

export type ContactMail = {
  /** destinatario: di norma info@santalfonso.org */
  to?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: { name: string; address: string };
};

/** true se c'è un modo per spedire: Resend oppure casella SMTP completa. */
export function canSendContactMail(c: ContactConfig): boolean {
  return !!c.resendApiKey || !!(c.smtpHost && c.smtpUser && c.smtpPassword);
}

/**
 * Spedisce a info@santalfonso.org. Con la chiave Resend usa la sua API su HTTPS
 * (Aruba rifiuta le connessioni SMTP dai server cloud come Vercel); altrimenti la casella SMTP.
 */
export async function sendContactMail(c: ContactConfig, mail: ContactMail): Promise<void> {
  if (c.resendApiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${c.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${CONTACT_FROM.name} <${CONTACT_FROM.address}>`,
        to: [mail.to ?? CONTACT_TO],
        subject: mail.subject,
        text: mail.text,
        ...(mail.html && { html: mail.html }),
        ...(mail.replyTo && { reply_to: `${mail.replyTo.name.replace(/[<>"\r\n]/g, "")} <${mail.replyTo.address}>` }),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      throw new Error(`Resend ${res.status}: ${data?.message ?? res.statusText}`);
    }
    return;
  }

  if (!c.smtpHost || !c.smtpUser || !c.smtpPassword) throw new Error("Configurazione di invio mancante");
  const transporter = nodemailer.createTransport({
    host: c.smtpHost,
    port: c.smtpPort,
    secure: c.smtpPort === 465,
    auth: { user: c.smtpUser, pass: c.smtpPassword },
  });
  await transporter.sendMail({
    from: { name: CONTACT_FROM.name, address: c.smtpUser },
    to: mail.to ?? CONTACT_TO,
    replyTo: mail.replyTo,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}
