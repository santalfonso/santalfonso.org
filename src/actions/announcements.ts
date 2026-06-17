"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { announcements } from "@/db/schema";
import { sendPushToAll } from "@/actions/push";
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

  const title = (formData.get("title") as string).trim();
  const text = (formData.get("text") as string).trim();

  if (!title) return { error: "Il titolo è obbligatorio." };
  if (title.length > 30) return { error: "Il titolo non può superare 30 caratteri." };
  if (!text) return { error: "Il testo è obbligatorio." };
  if (text.length > 300) return { error: "Il testo non può superare 300 caratteri." };

  const [inserted] = await db
    .insert(announcements)
    .values({ title, text })
    .returning({ id: announcements.id });

  sendPushToAll({ title, body: text, url: `/?avviso=${inserted.id}` }).catch(() => {});

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
