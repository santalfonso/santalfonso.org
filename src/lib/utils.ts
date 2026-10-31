export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Fuso della parrocchia: il server (Vercel) gira in UTC, i visitatori a Roma. */
export const TIME_ZONE = "Europe/Rome";

/** Data da DB o ISO; le date di SQLite (`datetime('now')`, "AAAA-MM-GG HH:MM:SS") sono in UTC. */
function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(value) ? `${value.replace(" ", "T")}Z` : value;
  const date = new Date(iso);
  return isNaN(date.getTime()) ? null : date;
}

export function formatDate(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "";
  return date.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  });
}

export function formatDateTime(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "";
  return date.toLocaleString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDayNumber(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "";
  return date.toLocaleDateString("it-IT", { day: "2-digit", timeZone: TIME_ZONE });
}

export function formatMonthName(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "";
  return date.toLocaleDateString("it-IT", { month: "long", timeZone: TIME_ZONE });
}

export function formatTime(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "";
  return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
}

/** Scarto in millisecondi dell'ora di Roma rispetto a UTC nell'istante `t` (+1 h d'inverno, +2 h d'estate). */
function romeOffset(t: number): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(t))
      .map((p) => [p.type, p.value])
  );
  const wall = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return wall - Math.floor(t / 1000) * 1000;
}

/** "AAAA-MM-GGTHH:MM" letto come ora di Roma (campo datetime-local) → ISO in UTC, o null se non valido. */
export function romeLocalToIso(value: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const wall = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  const check = new Date(wall);
  if (check.getUTCMonth() !== +m[2] - 1 || check.getUTCDate() !== +m[3]) return null;
  return new Date(wall - romeOffset(wall - romeOffset(wall))).toISOString();
}

/** ISO in UTC → "AAAA-MM-GGTHH:MM" nell'ora di Roma, per il campo datetime-local. */
export function isoToRomeLocal(iso: string | null | undefined): string {
  const date = toDate(iso);
  if (!date) return "";
  const t = date.getTime();
  return new Date(t + romeOffset(t)).toISOString().slice(0, 16);
}
