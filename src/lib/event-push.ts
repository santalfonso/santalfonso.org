import { and, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { events, settings } from "@/db/schema";
import { notificationImage } from "@/lib/image-url";
import type { PushPayload } from "@/lib/push-send";
import { formatDate, formatTime, TIME_ZONE } from "@/lib/utils";

type EventForPush = {
  id: number;
  title: string;
  location: string | null;
  posterUrl: string | null;
  startsAt: string;
};

/** Notifica per un evento appena pubblicato. */
export function newEventPush(e: EventForPush): PushPayload {
  return {
    title: `Nuovo evento: ${e.title}`,
    body: `${formatDate(e.startsAt)} · ore ${formatTime(e.startsAt)}${e.location ? ` · ${e.location}` : ""}`,
    url: `/?evento=${e.id}`,
    image: notificationImage(e.posterUrl),
    tag: `evento-${e.id}`,
  };
}

/** Promemoria del mattino nel giorno dell'evento. */
export function todayEventPush(e: EventForPush): PushPayload {
  return {
    title: `Oggi: ${e.title}`,
    body: `Ti aspettiamo alle ${formatTime(e.startsAt)}${e.location ? ` · ${e.location}` : ""}. Tocca per i dettagli.`,
    url: `/?evento=${e.id}`,
    image: notificationImage(e.posterUrl),
    tag: `evento-${e.id}`,
  };
}

/** Data e ora correnti a Roma. */
export function romeNow(now = new Date()): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
}

/** Giorno (AAAA-MM-GG) a Roma di un istante ISO. */
function romeDay(iso: string): string {
  return romeNow(new Date(iso)).date;
}

/** Ora dalla quale parte il promemoria del giorno (ora di Roma). */
export const REMINDER_HOUR = 9;

/**
 * Eventi che iniziano oggi (a Roma) e non hanno ancora avuto il promemoria.
 * Ogni evento viene "prenotato" nella tabella settings prima dell'invio, così due
 * esecuzioni ravvicinate del cron non mandano la stessa notifica due volte.
 */
export async function claimTodayReminders(now = new Date()): Promise<EventForPush[]> {
  const { date } = romeNow(now);
  // finestra larga in UTC (±1 giorno), poi si filtra sul giorno di Roma
  const from = new Date(now.getTime() - 36 * 3600_000).toISOString();
  const to = new Date(now.getTime() + 36 * 3600_000).toISOString();
  const rows = await db
    .select({ id: events.id, title: events.title, location: events.location, posterUrl: events.posterUrl, startsAt: events.startsAt })
    .from(events)
    .where(and(gte(events.startsAt, from), lt(events.startsAt, to)));

  const claimed: EventForPush[] = [];
  for (const e of rows) {
    if (romeDay(e.startsAt) !== date) continue;
    const inserted = await db
      .insert(settings)
      .values({ key: `event_reminder:${e.id}:${date}`, value: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .onConflictDoNothing()
      .returning({ key: settings.key });
    if (inserted.length > 0) claimed.push(e);
  }
  return claimed;
}
