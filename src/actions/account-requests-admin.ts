"use server";

import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireSuperAdmin } from "@/auth";
import { db } from "@/db";
import { accountRequests, users } from "@/db/schema";
import { canSendContactMail, getContactConfig, sendContactMail } from "@/lib/contact-config";
import { welcomeEmailHtml } from "@/lib/contact-email";
import { createPasswordToken, minPasswordLength, PASSWORD_LINK_DAYS, siteOrigin } from "@/lib/password-token";
import { canManageRole, ROLE_LABEL, type Role } from "@/lib/roles";

/** Esito per il pannello: messaggio, ed eventualmente il link da inviare a mano se l'email non è partita. */
export type AdminLinkState = { error?: string; done?: string; link?: string } | undefined;

/** Manda il link per scegliere la password; se l'email non parte restituisce il link da inviare a mano. */
async function deliverPasswordLink(
  user: { id: number; name: string; email: string; role: Role },
  reset: boolean,
): Promise<{ sent: boolean; link: string }> {
  const token = await createPasswordToken(user.id);
  const link = `${siteOrigin(await headers())}/imposta-password?t=${token}`;
  const config = await getContactConfig();
  if (!canSendContactMail(config)) return { sent: false, link };
  const minLength = minPasswordLength(user.role);
  try {
    await sendContactMail(config, {
      to: user.email,
      subject: reset ? "Scegli la password del tuo account" : "Il tuo account sul sito della parrocchia è pronto",
      text:
        `Ciao ${user.name},\n\n` +
        (reset
          ? "ecco il nuovo link per scegliere la password del tuo account sul sito della parrocchia.\n\n"
          : "il tuo account sul sito della Parrocchia Sant'Alfonso Maria de' Liguori è pronto.\n\n") +
        `Ruolo: ${ROLE_LABEL[user.role]}\n\nScegli la password (almeno ${minLength} caratteri): ${link}\n\n` +
        `Il link vale ${PASSWORD_LINK_DAYS} giorni e si può usare una volta sola.`,
      html: welcomeEmailHtml({
        name: user.name,
        roleLabel: ROLE_LABEL[user.role],
        link,
        days: PASSWORD_LINK_DAYS,
        minLength,
        reset,
      }),
    });
    return { sent: true, link };
  } catch (error) {
    console.error("Link per la password: email non inviata", error);
    return { sent: false, link };
  }
}

/** Conferma una richiesta: crea l'account con il ruolo scelto e manda il link per la password. */
export async function approveAccountRequest(id: number, _prev: AdminLinkState, formData: FormData): Promise<AdminLinkState> {
  let me;
  try {
    me = await requireSuperAdmin();
  } catch {
    return { error: "Non autorizzato." };
  }
  const role = formData.get("role");
  if (typeof role !== "string" || !canManageRole(me.role, role as Role)) return { error: "Scegli un ruolo valido." };

  const request = await db.query.accountRequests.findFirst({
    where: and(eq(accountRequests.id, id), eq(accountRequests.status, "pending")),
  });
  if (!request) return { error: "La richiesta non c'è più: forse è già stata gestita." };

  const email = request.email.toLowerCase();
  const existing = await db.query.users.findFirst({ where: eq(users.email, email), columns: { id: true } });
  if (existing) return { error: "Esiste già un account con questa email: rifiuta la richiesta o invia un nuovo link dall'elenco." };

  // password casuale che nessuno conosce: l'account si usa solo dopo aver scelto la propria
  const [created] = await db
    .insert(users)
    .values({
      name: request.name,
      email,
      passwordHash: await hash(randomBytes(32).toString("base64url"), 12),
      role: role as Role,
    })
    .returning({ id: users.id });

  await db
    .update(accountRequests)
    .set({ status: "approved", handledBy: Number(me.id) || null, handledAt: new Date().toISOString() })
    .where(eq(accountRequests.id, id));

  const { sent, link } = await deliverPasswordLink(
    { id: created.id, name: request.name, email, role: role as Role },
    false,
  );
  // niente revalidatePath qui: la pagina si aggiornerebbe subito togliendo la scheda con l'esito
  // (e l'eventuale link da copiare); l'aggiornamento parte con il pulsante "OK" della scheda
  return sent
    ? { done: `Account creato. Abbiamo inviato a ${email} il link per scegliere la password.` }
    : { done: "Account creato, ma l'email non è partita: invia tu questo link alla persona.", link };
}

/** Rifiuta una richiesta: esce dall'elenco, nessuna email. */
export async function rejectAccountRequest(id: number): Promise<void> {
  const me = await requireSuperAdmin();
  await db
    .update(accountRequests)
    .set({ status: "rejected", handledBy: Number(me.id) || null, handledAt: new Date().toISOString() })
    .where(and(eq(accountRequests.id, id), eq(accountRequests.status, "pending")));
  revalidatePath("/admin/utenti");
}

/** Nuovo link per la password a un utente esistente (link scaduto o password dimenticata). */
export async function sendPasswordLink(userId: number): Promise<AdminLinkState> {
  let me;
  try {
    me = await requireSuperAdmin();
  } catch {
    return { error: "Non autorizzato." };
  }
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true, name: true, email: true, role: true },
  });
  if (!user) return { error: "Utente non trovato." };
  if (String(user.id) === me.id || !canManageRole(me.role, user.role)) return { error: "Non puoi farlo per questo utente." };

  const { sent, link } = await deliverPasswordLink(user, true);
  revalidatePath("/admin/utenti");
  return sent
    ? { done: `Link inviato a ${user.email}.` }
    : { done: "L'email non è partita: invia tu questo link alla persona.", link };
}
