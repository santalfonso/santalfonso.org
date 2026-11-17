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
} as const;

export type ContactConfig = {
  smtpHost: string | null;
  smtpPort: number;
  smtpUser: string | null;
  smtpPassword: string | null;
  recaptchaSiteKey: string | null;
  recaptchaSecretKey: string | null;
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
  };
}

/** Solo la chiave pubblica del sito, per la pagina Contatti. */
export async function getRecaptchaSiteKey(): Promise<string | null> {
  return (await getContactConfig()).recaptchaSiteKey;
}

/** Indirizzo che riceve i messaggi del form. */
export const CONTACT_TO = "info@santalfonso.org";

/** Trasporto SMTP dalla configurazione, o null se mancano host, utente o password. */
export function contactTransport(c: ContactConfig) {
  if (!c.smtpHost || !c.smtpUser || !c.smtpPassword) return null;
  return nodemailer.createTransport({
    host: c.smtpHost,
    port: c.smtpPort,
    secure: c.smtpPort === 465,
    auth: { user: c.smtpUser, pass: c.smtpPassword },
  });
}
