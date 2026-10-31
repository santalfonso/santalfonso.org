"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/auth";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { isOwnCloudinaryUrl } from "@/lib/resource-file";
import type { ActionState } from "./articles";

const resourceSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200, "Il titolo è troppo lungo"),
  description: z.string().max(2000, "La descrizione è troppo lunga").optional(),
  category: z.string().trim().min(1, "La categoria è obbligatoria").max(80, "La categoria è troppo lunga"),
});

export async function createResource(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaff();
  const parsed = resourceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    category: formData.get("category"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const fileUrl = formData.get("fileUrl");
  if (typeof fileUrl !== "string" || !fileUrl) {
    return { error: "Seleziona un file da caricare" };
  }
  // il file arriva dal caricamento su Cloudinary del form: altri indirizzi non sono accettati
  if (!isOwnCloudinaryUrl(fileUrl)) {
    return { error: "File non valido: caricalo di nuovo dal modulo" };
  }

  const fileName = String(formData.get("fileName") ?? "").trim().slice(0, 200) || "documento";
  const fileSize = Math.max(0, Math.min(parseInt(formData.get("fileSize") as string, 10) || 0, 2 ** 31 - 1));

  const { title, description, category } = parsed.data;
  await db.insert(resources).values({
    title,
    description: description || null,
    category,
    fileUrl,
    fileName,
    fileSize,
  });

  revalidatePath("/risorse");
  redirect("/admin/risorse");
}

export async function deleteResource(id: number) {
  await requireStaff();
  await db.delete(resources).where(eq(resources.id, id));
  revalidatePath("/risorse");
  revalidatePath("/admin/risorse");
}
