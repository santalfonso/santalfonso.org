import { claimTodayReminders, REMINDER_HOUR, romeNow, todayEventPush } from "@/lib/event-push";
import { deliverPush } from "@/lib/push-send";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Promemoria del mattino per gli eventi del giorno, chiamato dal cron di Vercel (vercel.json).
 * Il cron gira in UTC: due orari (7 e 8 UTC) coprono le 9 di Roma con l'ora legale e senza;
 * prima delle 9 non parte nulla e ogni evento riceve un solo promemoria al giorno.
 * Se CRON_SECRET è impostata su Vercel, la richiesta deve portarla (Vercel la aggiunge da solo).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
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
