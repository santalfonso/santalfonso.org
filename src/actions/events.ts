"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/auth";
import { db } from "@/db";
import { events } from "@/db/schema";
import { isOwnCloudinaryUrl } from "@/lib/resource-file";
import { romeLocalToIso } from "@/lib/utils";
import type { ActionState } from "./articles";

const eventSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200, "Il titolo è troppo lungo"),
  description: z.string().max(5000, "La descrizione è troppo lunga").optional(),
  location: z.string().max(200, "Il luogo è troppo lungo").optional(),
  startsAt: z.string().min(1, "La data di inizio è obbligatoria"),
  endsAt: z.string().optional(),
});

type EventFields = {
  title: string;
  description: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
};

/** Legge il form; gli orari del campo datetime-local sono quelli di Roma (il server gira in UTC). */
function parseForm(formData: FormData): { data: EventFields } | { error: string } {
  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    location: formData.get("location") ?? undefined,
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { title, description, location, startsAt, endsAt } = parsed.data;

  const start = romeLocalToIso(startsAt);
  if (!start) return { error: "La data di inizio non è valida" };
  const end = endsAt ? romeLocalToIso(endsAt) : null;
  if (endsAt && !end) return { error: "La data di fine non è valida" };
  if (end && end < start) return { error: "La fine non può essere prima dell'inizio" };

  return {
    data: { title, description: description || null, location: location || null, startsAt: start, endsAt: end },
  };
}

/** La locandina è caricata dal browser su Cloudinary: al server arriva solo l'indirizzo. */
function posterFromForm(formData: FormData): string | undefined {
  const url = formData.get("posterImage");
  return typeof url === "string" && url && isOwnCloudinaryUrl(url) ? url : undefined;
}

export async function createEvent(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaff();
  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  await db.insert(events).values({ ...parsed.data, posterUrl: posterFromForm(formData) ?? null });

  revalidatePath("/");
  revalidatePath("/calendario");
  redirect("/admin/eventi");
}

export async function updateEvent(
  id: number,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaff();
  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  // senza una nuova locandina resta quella attuale
  const posterUrl = posterFromForm(formData);
  await db
    .update(events)
    .set({ ...parsed.data, ...(posterUrl ? { posterUrl } : {}) })
    .where(eq(events.id, id));

  revalidatePath("/");
  revalidatePath("/calendario");
  redirect("/admin/eventi");
}

export async function deleteEvent(id: number) {
  await requireStaff();
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/");
  revalidatePath("/calendario");
  revalidatePath("/admin/eventi");
}
