"use server";

import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSuperAdmin } from "@/auth";
import { db } from "@/db";
import { resourceCategories, resources } from "@/db/schema";
import { isOwnCloudinaryUrl } from "@/lib/resource-file";

export type ResourceFormState = { error?: string; success?: boolean } | undefined;

/* ---------------- Categorie ---------------- */

const categorySchema = z.object({
  name: z.string().trim().min(1, "Il nome della categoria è obbligatorio").max(120, "Il nome è troppo lungo"),
  description: z.string().trim().max(500, "La descrizione è troppo lunga").optional(),
});

function parseCategory(formData: FormData) {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message } as const;
  const image = formData.get("image");
  const imageUrl = typeof image === "string" && image && isOwnCloudinaryUrl(image) ? image : undefined;
  const focus = formData.get("imageFocus");
  const imageFocus = typeof focus === "string" && /^\d{1,3}% \d{1,3}%$/.test(focus) ? focus : undefined;
  return { data: { name: parsed.data.name, description: parsed.data.description || null, imageUrl, imageFocus } } as const;
}

function revalidateResources(categoryId?: number) {
  revalidatePath("/risorse");
  revalidatePath("/admin/risorse");
  if (categoryId) revalidatePath(`/admin/risorse/categorie/${categoryId}`);
}

export async function createCategory(_prev: ResourceFormState, formData: FormData): Promise<ResourceFormState> {
  await requireSuperAdmin();
  const parsed = parseCategory(formData);
  if ("error" in parsed) return { error: parsed.error };
  if (!parsed.data.imageUrl) return { error: "Carica una foto per la categoria" };

  // in fondo all'elenco
  const [{ last }] = await db.select({ last: sql<number>`coalesce(max(${resourceCategories.position}), 0)` }).from(resourceCategories);
  const [created] = await db
    .insert(resourceCategories)
    .values({ ...parsed.data, imageFocus: parsed.data.imageFocus ?? null, position: Number(last) + 1 })
    .returning({ id: resourceCategories.id });

  revalidateResources();
  redirect(`/admin/risorse/categorie/${created.id}`);
}

export async function updateCategory(id: number, _prev: ResourceFormState, formData: FormData): Promise<ResourceFormState> {
  await requireSuperAdmin();
  const parsed = parseCategory(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { name, description, imageUrl, imageFocus } = parsed.data;
  await db
    .update(resourceCategories)
    .set({
      name,
      description,
      // foto e punto focale cambiano solo se è stato toccato il campo
      ...(imageUrl ? { imageUrl } : {}),
      ...(imageFocus ? { imageFocus } : {}),
    })
    .where(eq(resourceCategories.id, id));
  // il nome resta allineato anche sui file già caricati
  await db.update(resources).set({ category: name }).where(eq(resources.categoryId, id));

  revalidateResources(id);
  return { success: true };
}

/** Elimina la categoria con tutti i suoi file. */
export async function deleteCategory(id: number) {
  await requireSuperAdmin();
  await db.delete(resources).where(eq(resources.categoryId, id));
  await db.delete(resourceCategories).where(eq(resourceCategories.id, id));
  revalidateResources();
}

/** Mostra o nasconde una categoria nella pagina Risorse (nascosta: anche i suoi file non si scaricano). */
export async function setCategoryActive(id: number, active: boolean) {
  await requireSuperAdmin();
  await db.update(resourceCategories).set({ active: Boolean(active) }).where(eq(resourceCategories.id, id));
  revalidateResources(id);
}

/** Sposta una categoria di un posto in su (-1) o in giù (+1) nella pagina Risorse. */
export async function moveCategory(id: number, direction: -1 | 1) {
  await requireSuperAdmin();
  const list = await db
    .select({ id: resourceCategories.id })
    .from(resourceCategories)
    .orderBy(asc(resourceCategories.position), asc(resourceCategories.id));
  const from = list.findIndex((c) => c.id === id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= list.length) return;
  [list[from], list[to]] = [list[to], list[from]];
  // riscrive le posizioni 1..n: corregge anche eventuali doppioni
  for (const [i, c] of list.entries()) {
    await db.update(resourceCategories).set({ position: i + 1 }).where(eq(resourceCategories.id, c.id));
  }
  revalidateResources();
}

/* ---------------- File ---------------- */

const resourceSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(200, "Il titolo è troppo lungo"),
  description: z.string().trim().max(2000, "La descrizione è troppo lunga").optional(),
});

/** Carica un file dentro una categoria. */
export async function createResource(
  categoryId: number,
  _prev: ResourceFormState,
  formData: FormData
): Promise<ResourceFormState> {
  await requireSuperAdmin();
  const category = await db.query.resourceCategories.findFirst({
    where: eq(resourceCategories.id, categoryId),
    columns: { id: true, name: true },
  });
  if (!category) return { error: "Categoria non trovata" };

  const parsed = resourceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
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

  await db.insert(resources).values({
    title: parsed.data.title,
    description: parsed.data.description || null,
    category: category.name,
    categoryId: category.id,
    fileUrl,
    fileName,
    fileSize,
  });

  revalidateResources(category.id);
  return { success: true };
}

/** Cambia titolo e descrizione di un file già caricato. */
export async function updateResource(id: number, _prev: ResourceFormState, formData: FormData): Promise<ResourceFormState> {
  await requireSuperAdmin();
  const parsed = resourceSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const [row] = await db
    .update(resources)
    .set({ title: parsed.data.title, description: parsed.data.description || null })
    .where(eq(resources.id, id))
    .returning({ categoryId: resources.categoryId });
  revalidateResources(row?.categoryId ?? undefined);
  return { success: true };
}

export async function deleteResource(id: number) {
  await requireSuperAdmin();
  const [row] = await db.delete(resources).where(eq(resources.id, id)).returning({ categoryId: resources.categoryId });
  revalidateResources(row?.categoryId ?? undefined);
}
