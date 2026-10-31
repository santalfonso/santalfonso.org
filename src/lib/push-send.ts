import webpush from "web-push";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

export type PushPayload = { title: string; body: string; url: string };

const BATCH = 100;

function initWebPush() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails("mailto:gabrielemichelenapoli@gmail.com", pub, priv);
  return true;
}

/**
 * Invia la notifica a tutti gli iscritti, a gruppi e con un tempo massimo per richiesta,
 * e toglie le iscrizioni scadute. Va chiamata solo dopo aver controllato i permessi
 * (di solito dentro `after()`, così su Vercel l'invio non si interrompe al redirect).
 */
export async function deliverPush(payload: PushPayload) {
  if (!initWebPush()) return;
  const subs = await db.query.pushSubscriptions.findMany();
  const dead: number[] = [];
  const body = JSON.stringify(payload);

  for (let i = 0; i < subs.length; i += BATCH) {
    await Promise.allSettled(
      subs.slice(i, i + BATCH).map(async (sub) => {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, body, {
            timeout: 10_000,
            TTL: 60 * 60 * 24,
          });
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) dead.push(sub.id);
        }
      })
    );
  }

  if (dead.length > 0) {
    await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, dead));
  }
}
