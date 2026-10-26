"use server";

import webpush from "web-push";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { requireStaff } from "@/auth";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

function initWebPush() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails("mailto:gabrielemichelenapoli@gmail.com", pub, priv);
  return true;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// Endpoint dei servizi push dei browser: solo https, niente indirizzi arbitrari
const subscriptionSchema = z.object({
  endpoint: z.string().max(1000).url().refine((u) => u.startsWith("https://"), "Endpoint non valido"),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});

export async function subscribeUser(input: PushSubscriptionData) {
  const parsed = subscriptionSchema.safeParse(input);
  if (!parsed.success) return { success: false };
  const sub = parsed.data;
  await db
    .insert(pushSubscriptions)
    .values({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth })
    .onConflictDoNothing();
  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  if (typeof endpoint !== "string" || endpoint.length > 1000) return { success: false };
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  return { success: true };
}

export async function sendPushToAll(payload: { title: string; body: string; url: string }) {
  // Esportata da un file "use server" = chiamabile da chiunque: solo staff.
  await requireStaff();
  if (!initWebPush()) return;
  const subs = await db.query.pushSubscriptions.findMany();
  if (subs.length === 0) return;

  const dead: number[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) dead.push(sub.id);
      }
    })
  );

  if (dead.length > 0) {
    await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, dead));
  }
}
