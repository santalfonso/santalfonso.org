"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { accountRequests, users } from "@/db/schema";
import { canSendContactMail, getContactConfig, sendContactMail } from "@/lib/contact-config";
import { accountRequestEmailHtml } from "@/lib/contact-email";
import { isLimited, recordFailure } from "@/lib/rate-limit";
import { verifyRecaptcha } from "@/lib/recaptcha";

/** Le richieste di account arrivano all'amministratore del sito. */
const ACCOUNT_REQUEST_TO = "gabrielemichele.napoli@gmail.com";
const RECAPTCHA_ACTION = "richiesta_account";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 3;

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]+$/;

export type AccountRequestValues = { name: string; email: string; message: string };
export type AccountRequestState =
  | { ok: true }
  | { ok?: false; error: string; values?: AccountRequestValues }
  | undefined;

function field(formData: FormData, name: string, max: number): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Richiesta di un account dalla pagina Accedi: salvata per il pannello Utenti e segnalata per email all'amministratore. */
export async function requestAccountAction(
  _prev: AccountRequestState,
  formData: FormData,
): Promise<AccountRequestState> {
  const values: AccountRequestValues = {
    name: field(formData, "name", 100),
    email: field(formData, "email", 200),
    message: field(formData, "message", 2000),
  };

  // campo nascosto: lo riempiono solo i robot
  if (field(formData, "website", 200)) return { ok: true };

  if (values.name.length < 2 || !values.email) {
    return { error: "Scrivi nome e cognome e la tua email.", values };
  }
  if (!EMAIL_RE.test(values.email)) {
    return { error: "L'indirizzo email non sembra corretto.", values };
  }

  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim().slice(0, 64);
  const key = `account-request:ip:${ip}`;
  if (isLimited(key, MAX_PER_IP)) {
    return { error: "Hai già inviato alcune richieste: riprova più tardi.", values };
  }

  const config = await getContactConfig();
  const human = await verifyRecaptcha({
    secret: config.recaptchaSecretKey,
    token: field(formData, "recaptcha", 4000),
    action: RECAPTCHA_ACTION,
    ip,
    host: h.get("host"),
    label: "Richiesta account",
  });
  if (!human) {
    return { error: "Non siamo riusciti a verificare l'invio: ricarica la pagina e riprova.", values };
  }


  const email = values.email.toLowerCase();
  // solo per l'amministratore (chi compila il form non lo viene a sapere)
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true },
  });

  // una sola richiesta in attesa per email: una nuova aggiorna quella già presente
  const pending = await db.query.accountRequests.findFirst({
    where: and(eq(accountRequests.email, email), eq(accountRequests.status, "pending")),
    columns: { id: true },
  });
  if (pending) {
    await db
      .update(accountRequests)
      .set({ name: values.name, message: values.message || null, createdAt: new Date().toISOString() })
      .where(eq(accountRequests.id, pending.id));
  } else {
    await db
      .insert(accountRequests)
      .values({ name: values.name, email, message: values.message || null, createdAt: new Date().toISOString() });
  }

  // a capo e tabulazioni fuori dall'oggetto, per non alterare le intestazioni
  const safeName = values.name.replace(/[\r\n\t]+/g, " ");
  // la richiesta è già salvata nel pannello: se l'email all'amministratore non parte, va bene lo stesso
  if (!canSendContactMail(config)) {
    console.error("Richiesta account: configurazione di invio mancante, richiesta solo nel pannello");
    recordFailure(key, WINDOW_MS);
    return { ok: true };
  }
  try {
    await sendContactMail(config, {
      to: ACCOUNT_REQUEST_TO,
      replyTo: { name: safeName, address: values.email },
      subject: `[Richiesta account] ${safeName}`,
      text:
        `Richiesta di account dal sito santalfonso.org\n\nNome: ${safeName}\nEmail: ${values.email}\n` +
        (existing ? "Attenzione: esiste già un account con questa email.\n" : "") +
        `\n${values.message || "(nessun messaggio)"}\n\nConferma o rifiuta in Amministrazione → Utenti: https://www.santalfonso.org/admin/utenti`,
      html: accountRequestEmailHtml({ ...values, name: safeName, alreadyRegistered: !!existing }),
    });
  } catch (error) {
    console.error("Richiesta account: email all'amministratore non inviata (la richiesta è nel pannello)", error);
  }

  recordFailure(key, WINDOW_MS);
  return { ok: true };
}
