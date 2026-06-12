"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/db";
import { events } from "@/db/schema";
import type { ActionState } from "./articles";

const eventSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  description: z.string().optional(),
  location: z.string().optional(),
  startsAt: z.string().min(1, "La data di inizio è obbligatoria"),
  endsAt: z.string().optional(),
});

function parseForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    location: formData.get("location") ?? undefined,
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") ?? undefined,
  });
}

export async function createEvent(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { title, description, location, startsAt, endsAt } = parsed.data;
  await db.insert(events).values({
    title,
    description: description || null,
    location: location || null,
    startsAt: new Date(startsAt).toISOString(),
    endsAt: endsAt ? new Date(endsAt).toISOString() : null,
  });

  revalidatePath("/");
  redirect("/admin/eventi");
}

export async function updateEvent(
  id: number,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { title, description, location, startsAt, endsAt } = parsed.data;
  await db
    .update(events)
    .set({
      title,
      description: description || null,
      location: location || null,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
    })
    .where(eq(events.id, id));

  revalidatePath("/");
  redirect("/admin/eventi");
}

export async function deleteEvent(id: number) {
  await requireUser();
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/");
  revalidatePath("/admin/eventi");
}
