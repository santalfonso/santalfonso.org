"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { requireUser } from "@/auth";

export type AnnouncementState = { error?: string } | undefined;

export async function createAnnouncement(
  _prev: AnnouncementState,
  formData: FormData,
): Promise<AnnouncementState> {
  try {
    await requireUser();
  } catch {
    return { error: "Non autorizzato." };
  }

  const text = (formData.get("text") as string).trim();
  if (!text) return { error: "Il testo dell'avviso non può essere vuoto." };

  await db.insert(announcements).values({ text });

  revalidatePath("/admin");
  revalidatePath("/");
  return undefined;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await requireUser();
  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath("/admin");
  revalidatePath("/");
}
