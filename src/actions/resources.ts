"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { uploadFile } from "@/lib/uploads";
import type { ActionState } from "./articles";

const resourceSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  description: z.string().optional(),
  category: z.string().min(1, "La categoria è obbligatoria"),
});

export async function createResource(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const parsed = resourceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    category: formData.get("category"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Seleziona un file da caricare" };
  }

  let fileUrl: string;
  try {
    fileUrl = await uploadFile(file);
  } catch {
    return { error: "Caricamento non riuscito. Verifica la configurazione Cloudinary." };
  }

  const { title, description, category } = parsed.data;
  await db.insert(resources).values({
    title,
    description: description || null,
    category,
    fileUrl,
    fileName: file.name,
    fileSize: file.size,
  });

  revalidatePath("/risorse");
  redirect("/admin/risorse");
}

export async function deleteResource(id: number) {
  await requireUser();
  await db.delete(resources).where(eq(resources.id, id));
  revalidatePath("/risorse");
  revalidatePath("/admin/risorse");
}
