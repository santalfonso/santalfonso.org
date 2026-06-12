"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/auth";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { uploadImage } from "@/lib/uploads";
import { slugify } from "@/lib/utils";

const articleSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  excerpt: z.string().optional(),
  body: z.string().min(1, "Il testo è obbligatorio"),
  published: z.boolean(),
});

export type ActionState = { error?: string } | undefined;

function parseForm(formData: FormData) {
  return articleSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt") ?? undefined,
    body: formData.get("body"),
    published: formData.get("published") === "on",
  });
}

async function coverFromForm(formData: FormData): Promise<string | undefined> {
  const file = formData.get("coverImage");
  if (file instanceof File && file.size > 0) {
    return uploadImage(file);
  }
  return undefined;
}

export async function createArticle(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let coverImageUrl: string | undefined;
  try {
    coverImageUrl = await coverFromForm(formData);
  } catch {
    return { error: "Caricamento immagine non riuscito. Verifica la configurazione Cloudinary." };
  }

  const { title, excerpt, body, published } = parsed.data;
  let slug = slugify(title);
  const existing = await db.query.articles.findFirst({
    where: eq(articles.slug, slug),
  });
  if (existing) slug = `${slug}-${Date.now()}`;

  await db.insert(articles).values({
    title,
    slug,
    excerpt: excerpt || null,
    body,
    coverImageUrl,
    published,
    publishedAt: published ? new Date().toISOString() : null,
  });

  revalidatePath("/");
  revalidatePath("/news");
  redirect("/admin/articoli");
}

export async function updateArticle(
  id: number,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireUser();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let coverImageUrl: string | undefined;
  try {
    coverImageUrl = await coverFromForm(formData);
  } catch {
    return { error: "Caricamento immagine non riuscito. Verifica la configurazione Cloudinary." };
  }

  const current = await db.query.articles.findFirst({
    where: eq(articles.id, id),
  });
  if (!current) return { error: "Articolo non trovato" };

  const { title, excerpt, body, published } = parsed.data;
  await db
    .update(articles)
    .set({
      title,
      excerpt: excerpt || null,
      body,
      published,
      publishedAt:
        published && !current.publishedAt
          ? new Date().toISOString()
          : current.publishedAt,
      ...(coverImageUrl ? { coverImageUrl } : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(articles.id, id));

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${current.slug}`);
  redirect("/admin/articoli");
}

export async function deleteArticle(id: number) {
  await requireUser();
  await db.delete(articles).where(eq(articles.id, id));
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/articoli");
}
