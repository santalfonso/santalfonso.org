"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/auth";
import { db } from "@/db";
import { articles, articleImages } from "@/db/schema";
import { slugify } from "@/lib/utils";
import { after } from "next/server";
import { deliverPush } from "@/lib/push-send";

const articleSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(300, "Il titolo è troppo lungo"),
  excerpt: z.string().max(1000, "L'estratto è troppo lungo").optional(),
  body: z.string().min(1, "Il testo è obbligatorio"),
  published: z.boolean(),
  publishedAt: z.string().optional(),
  coverImageFocus: z.string().optional(),
});

export type ActionState = { error?: string } | undefined;

/** Data del campo "Data di pubblicazione" (AAAA-MM-GG) → ISO; "invalid" se non è una data vera. */
function parsePublishedAt(raw: string | undefined): string | null | "invalid" {
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "invalid";
  const date = new Date(`${raw}T00:00:00.000Z`);
  return isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== raw ? "invalid" : date.toISOString();
}

function parseForm(formData: FormData) {
  return articleSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt") ?? undefined,
    body: formData.get("body"),
    published: formData.get("published") === "on",
    publishedAt: (formData.get("publishedAt") as string) || undefined,
    coverImageFocus: (formData.get("coverImageFocus") as string) || undefined,
  });
}

function coverFromForm(formData: FormData): string | undefined {
  const url = formData.get("coverImage");
  return typeof url === "string" && url ? url : undefined;
}

function galleryFromForm(formData: FormData): string[] {
  return formData
    .getAll("galleryImageUrl")
    .filter((v): v is string => typeof v === "string" && v.length > 0);
}

export async function createArticle(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const coverImageUrl = coverFromForm(formData);
  const galleryUrls = galleryFromForm(formData);

  const { title, excerpt, body, published, publishedAt: publishedAtRaw, coverImageFocus } = parsed.data;
  const chosenDate = parsePublishedAt(publishedAtRaw);
  if (chosenDate === "invalid") return { error: "La data di pubblicazione non è valida" };
  // titoli senza lettere latine danno uno slug vuoto: serve comunque un indirizzo
  let slug = slugify(title) || `articolo-${Date.now()}`;
  const existing = await db.query.articles.findFirst({
    where: eq(articles.slug, slug),
  });
  if (existing) slug = `${slug}-${Date.now()}`;

  const publishedAt = chosenDate ?? (published ? new Date().toISOString() : null);

  const [created] = await db.insert(articles).values({
    title,
    slug,
    excerpt: excerpt || null,
    body,
    coverImageUrl,
    coverImageFocus: coverImageFocus || "50% 50%",
    published,
    publishedAt,
  }).returning({ id: articles.id });

  if (galleryUrls.length > 0) {
    await db.insert(articleImages).values(
      galleryUrls.map((url, i) => ({ articleId: created.id, url, position: i }))
    );
  }

  if (published) {
    // dopo la risposta: su Vercel l'invio non si interrompe con il redirect
    after(() => deliverPush({
      title: title,
      body: excerpt || "Leggi la notizia sul sito della parrocchia.",
      url: `/news/${slug}`,
    }));
  }

  revalidatePath("/");
  revalidatePath("/news");
  redirect("/admin/articoli");
}

export async function updateArticle(
  id: number,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const coverImageUrl = coverFromForm(formData);
  const galleryUrls = galleryFromForm(formData);

  const current = await db.query.articles.findFirst({
    where: eq(articles.id, id),
  });
  if (!current) return { error: "Articolo non trovato" };

  // Cancella immagini segnate per rimozione
  const deleteIds = formData.getAll("deleteImageId").map(Number).filter(Boolean);
  if (deleteIds.length > 0) {
    await db.delete(articleImages).where(inArray(articleImages.id, deleteIds));
  }

  const { title, excerpt, body, published, publishedAt: publishedAtRaw, coverImageFocus } = parsed.data;
  const justPublished = published && !current.published;
  const chosenDate = parsePublishedAt(publishedAtRaw);
  if (chosenDate === "invalid") return { error: "La data di pubblicazione non è valida" };

  const publishedAt = published
    ? (chosenDate ?? current.publishedAt ?? new Date().toISOString())
    : current.publishedAt;

  await db
    .update(articles)
    .set({
      title,
      excerpt: excerpt || null,
      body,
      published,
      publishedAt,
      ...(coverImageUrl ? { coverImageUrl } : {}),
      ...(coverImageFocus ? { coverImageFocus } : {}),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(articles.id, id));

  if (justPublished) {
    // dopo la risposta: su Vercel l'invio non si interrompe con il redirect
    after(() => deliverPush({
      title: title,
      body: excerpt || "Leggi la notizia sul sito della parrocchia.",
      url: `/news/${current.slug}`,
    }));
  }

  // Aggiunge nuove immagini galleria
  if (galleryUrls.length > 0) {
    const existing = await db.query.articleImages.findMany({
      where: eq(articleImages.articleId, id),
    });
    const nextPosition = existing.length;
    await db.insert(articleImages).values(
      galleryUrls.map((url, i) => ({ articleId: id, url, position: nextPosition + i }))
    );
  }

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${current.slug}`);
  redirect("/admin/articoli");
}

export async function deleteArticle(id: number) {
  await requireStaff();
  await db.delete(articleImages).where(eq(articleImages.articleId, id));
  await db.delete(articles).where(eq(articles.id, id));
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/articoli");
}
