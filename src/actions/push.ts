"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { isLimited, recordFailure } from "@/lib/rate-limit";

export interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** Servizi push dei browser (Chrome/Edge/Android/Opera, Firefox, Safari, Windows). */
function isPushServiceHost(host: string): boolean {
  return (
    host === "fcm.googleapis.com" ||
    host === "android.googleapis.com" ||
    host === "updates.push.services.mozilla.com" ||
    host === "push.services.mozilla.com" ||
    host === "web.push.apple.com" ||
    host.endsWith(".push.apple.com") ||
    host.endsWith(".notify.windows.com")
  );
}

function decodeKey(k: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(k)) return null;
  return Buffer.from(k.replace(/=+$/, ""), "base64url");
}

// Endpoint dei servizi push dei browser: solo https verso i servizi noti, niente indirizzi arbitrari
const subscriptionSchema = z.object({
  endpoint: z
    .string()
    .max(1000)
    .url()
    .refine((u) => {
      const url = new URL(u);
      return url.protocol === "https:" && isPushServiceHost(url.hostname);
    }, "Endpoint non valido"),
  // chiavi del browser in base64url: p256dh è un punto P-256 non compresso (65 byte, inizia con 0x04),
  // auth è un segreto di 16 byte. Con chiavi diverse la cifratura fallisce a ogni invio e
  // l'iscrizione non verrebbe mai rimossa.
  keys: z.object({
    p256dh: z.string().max(200).refine((k) => {
      const raw = decodeKey(k);
      return raw?.length === 65 && raw[0] === 4;
    }, "Chiave non valida"),
    auth: z.string().max(100).refine((k) => decodeKey(k)?.length === 16, "Chiave non valida"),
  }),
});

const NEW_SUBS_WINDOW_MS = 60 * 60 * 1000;
const MAX_NEW_SUBS_PER_IP = 20;

/** Iscrizione (pubblica, anche senza account) o aggiornamento delle chiavi di un'iscrizione esistente. */
export async function subscribeUser(input: PushSubscriptionData) {
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) return { success: false };
  const sub = parsed.data;

  const known = await db.query.pushSubscriptions.findFirst({
    where: eq(pushSubscriptions.endpoint, sub.endpoint),
    columns: { id: true },
  });
  if (known) {
    await db
      .update(pushSubscriptions)
      .set({ p256dh: sub.keys.p256dh, auth: sub.keys.auth })
      .where(eq(pushSubscriptions.id, known.id));
    return { success: true };
  }

  // poche iscrizioni nuove per indirizzo IP: blocca chi le inserisce in massa
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim().slice(0, 64);
  const key = `push:ip:${ip}`;
  if (isLimited(key, MAX_NEW_SUBS_PER_IP)) return { success: false };
  recordFailure(key, NEW_SUBS_WINDOW_MS);

  await db
    .insert(pushSubscriptions)
    .values({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } });
  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  if (typeof endpoint !== "string" || endpoint.length > 1000) return { success: false };
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  return { success: true };
}
