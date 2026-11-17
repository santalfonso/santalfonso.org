"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireOwner } from "@/auth";
import { CONTACT_KEYS, CONTACT_TO, contactTransport, getContactConfig } from "@/lib/contact-config";
import { sealSecret } from "@/lib/secret-box";

export type ContactSettingsState = { error?: string; success?: string } | undefined;

function text(formData: FormData, name: string, max = 300): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

async function put(key: string, value: string) {
  const updatedAt = new Date().toISOString();
  await db
    .insert(settings)
    .values({ key, value, updatedAt })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt } });
}

/**
 * Salva SMTP e reCAPTCHA del form contatti. Password e chiave segreta finiscono cifrate;
 * lasciate vuote, restano quelle già salvate.
 */
export async function saveContactSettings(
  _prev: ContactSettingsState,
  formData: FormData,
): Promise<ContactSettingsState> {
  try {
    await requireOwner();
  } catch {
    return { error: "Non autorizzato." };
  }

  const host = text(formData, "smtp_host");
  const port = text(formData, "smtp_port", 5);
  const user = text(formData, "smtp_user");
  const password = text(formData, "smtp_password", 500);
  const siteKey = text(formData, "recaptcha_site_key");
  const secretKey = text(formData, "recaptcha_secret_key");

  if (!host || !user) return { error: "Inserisci server SMTP e utente." };
  if (!/^[a-z0-9.-]+$/i.test(host)) return { error: "Il server SMTP non sembra corretto." };
  const portNum = Number(port || "465");
  if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) return { error: "Porta SMTP non valida." };
  if (siteKey && !/^[\w-]{20,100}$/.test(siteKey)) return { error: "La chiave del sito reCAPTCHA non sembra corretta." };

  await put(CONTACT_KEYS.smtpHost, host);
  await put(CONTACT_KEYS.smtpPort, String(portNum));
  await put(CONTACT_KEYS.smtpUser, user);
  if (password) await put(CONTACT_KEYS.smtpPassword, sealSecret(password));
  if (siteKey) await put(CONTACT_KEYS.recaptchaSiteKey, siteKey);
  if (secretKey) await put(CONTACT_KEYS.recaptchaSecretKey, sealSecret(secretKey));

  revalidatePath("/admin/configurazioni");
  revalidatePath("/contatti");
  return { success: "Impostazioni salvate." };
}

/** Invia un'email di prova a info@santalfonso.org con la configurazione salvata. */
export async function sendContactTestEmail(): Promise<ContactSettingsState> {
  let email: string | null | undefined;
  try {
    email = (await requireOwner()).email;
  } catch {
    return { error: "Non autorizzato." };
  }

  const config = await getContactConfig();
  const transporter = contactTransport(config);
  if (!transporter || !config.smtpUser) return { error: "Configurazione SMTP incompleta: salva server, utente e password." };

  try {
    await transporter.sendMail({
      from: { name: "Sito santalfonso.org", address: config.smtpUser },
      to: CONTACT_TO,
      subject: "[Contatti] Email di prova",
      text: `Email di prova inviata da Admin → Configurazioni${email ? ` da ${email}` : ""}.\nSe la ricevi, il form contatti del sito è pronto.`,
    });
  } catch (error) {
    console.error("Email di prova non riuscita", error);
    const msg = error instanceof Error ? error.message : String(error);
    return { error: `Invio non riuscito: ${msg.slice(0, 200)}` };
  }
  return { success: `Email di prova inviata a ${CONTACT_TO}.` };
}
