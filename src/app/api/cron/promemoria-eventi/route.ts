import { timingSafeEqual } from "node:crypto";
import { claimTodayReminders, REMINDER_HOUR, romeNow, todayEventPush } from "@/lib/event-push";
import { deliverPush } from "@/lib/push-send";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Promemoria del mattino per gli eventi del giorno, chiamato dal cron di Vercel (vercel.json).
 * Il cron gira in UTC: due orari (7 e 8 UTC) coprono le 9 di Roma con l'ora legale e senza;
 * prima delle 9 non parte nulla e ogni evento riceve un solo promemoria al giorno.
 * La richiesta deve portare CRON_SECRET (Vercel la aggiunge da solo se la variabile è impostata).
 * In produzione, senza CRON_SECRET la rotta resta chiusa; in locale si può chiamare senza.
 */
function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    if (!process.env.CRON_SECRET) console.error("Cron promemoria: CRON_SECRET non impostata, richiesta rifiutata");
    return new Response("Non autorizzato", { status: 401 });
  }

  const { hour } = romeNow();
  if (hour < REMINDER_HOUR) return Response.json({ sent: 0, reason: "prima delle 9 a Roma" });

  const todays = await claimTodayReminders();
  for (const event of todays) {
    await deliverPush(todayEventPush(event));
  }
  return Response.json({ sent: todays.length, events: todays.map((e) => e.id) });
}
