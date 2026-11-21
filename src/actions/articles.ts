"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { canEditContent, requireStaff, requireSuperAdmin } from "@/auth";
import { db } from "@/db";
import { articles, articleImages, settings } from "@/db/schema";
import { isoToRomeLocal, slugify } from "@/lib/utils";
import { isOwnCloudinaryUrl } from "@/lib/resource-file";
import { after } from "next/server";
import { deliverPush } from "@/lib/push-send";

const articleSchema = z.object({
  title: z.string().trim().min(1, "Il titolo è obbligatorio").max(300, "Il titolo è troppo lungo"),
  excerpt: z.string().max(1000, "L'estratto è troppo lungo").optional(),
  body: z.string().min(1, "Il testo è obbligatorio"),
  published: z.boolean(),
  publishedAt: z.string().optional(),
  coverImageFocus: z.string().regex(/^\d{1,3}% \d{1,3}%$/, "Punto focale non valido").optional(),
});

const MAX_GALLERY_IMAGES = 40;

/** Giorno (AAAA-MM-GG) di una data ISO, secondo l'ora di Roma. */
function romeDay(iso: string): string {
  return isoToRomeLocal(iso).slice(0, 10);
}

/**
 * Data scelta nel form → valore da salvare: se è oggi si usa l'ora attuale (così gli articoli
 * dello stesso giorno restano in ordine), altrimenti la mezzanotte di quel giorno.
 */
function dateOrNow(raw: string, chosen: string): string {
  return raw === romeDay(new Date().toISOString()) ? new Date().toISOString() : chosen;
}

/**
 * La notifica "nuova notizia" parte una sola volta per articolo: la prenotazione nella tabella
 * settings impedisce di rimandarla nascondendo e ripubblicando lo stesso articolo.
 */
async function claimArticlePush(id: number): Promise<boolean> {
  const inserted = await db
    .insert(settings)
    .values({ key: `article_push:${id}`, value: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .onConflictDoNothing()
    .returning({ key: settings.key });
  return inserted.length > 0;
}

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

// solo immagini caricate sul Cloudinary della parrocchia, come per gli eventi
function coverFromForm(formData: FormData): string | undefined {
  const url = formData.get("coverImage");
  return typeof url === "string" && url && isOwnCloudinaryUrl(url) ? url : undefined;
}

function galleryFromForm(formData: FormData): string[] {
  return formData
    .getAll("galleryImageUrl")
    .filter((v): v is string => typeof v === "string" && v.length > 0 && isOwnCloudinaryUrl(v));
}

export async function createArticle(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const coverImageUrl = coverFromForm(formData);
  const galleryUrls = galleryFromForm(formData);
  if (galleryUrls.length > MAX_GALLERY_IMAGES) return { error: `La galleria può avere al massimo ${MAX_GALLERY_IMAGES} immagini.` };

  const { title, excerpt, body, published, publishedAt: publishedAtRaw, coverImageFocus } = parsed.data;
  const chosenDate = parsePublishedAt(publishedAtRaw);
  if (chosenDate === "invalid") return { error: "La data di pubblicazione non è valida" };
  // titoli senza lettere latine danno uno slug vuoto: serve comunque un indirizzo
  let slug = slugify(title) || `articolo-${Date.now()}`;
  const existing = await db.query.articles.findFirst({
    where: eq(articles.slug, slug),
  });
  if (existing) slug = `${slug}-${Date.now()}`;

  const publishedAt = chosenDate
    ? (published ? dateOrNow(publishedAtRaw!, chosenDate) : chosenDate)
    : (published ? new Date().toISOString() : null);

  const [created] = await db.insert(articles).values({
    createdBy: Number(user.id) || null,
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

  if (published && (await claimArticlePush(created.id))) {
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
  const user = await requireStaff();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const coverImageUrl = coverFromForm(formData);
  const galleryUrls = galleryFromForm(formData);

  const current = await db.query.articles.findFirst({
    where: eq(articles.id, id),
  });
  if (!current) return { error: "Articolo non trovato" };
  if (!canEditContent(user, current.createdBy)) return { error: "Puoi modificare solo gli articoli che hai creato tu." };

  const { title, excerpt, body, published, publishedAt: publishedAtRaw, coverImageFocus } = parsed.data;
  const justPublished = published && !current.published;
  const chosenDate = parsePublishedAt(publishedAtRaw);
  if (chosenDate === "invalid") return { error: "La data di pubblicazione non è valida" };

  // Il form precompila sempre la data: se non è stata cambiata (stesso giorno di quella salvata)
  // si tiene l'ora già salvata, e alla prima pubblicazione di una bozza vale la data di oggi.
  const dateUnchanged = !chosenDate || (!!current.publishedAt && publishedAtRaw === romeDay(current.publishedAt));
  let publishedAt = current.publishedAt;
  if (justPublished && dateUnchanged) publishedAt = new Date().toISOString();
  else if (published && !dateUnchanged) publishedAt = dateOrNow(publishedAtRaw!, chosenDate!);
  else if (published && !publishedAt) publishedAt = new Date().toISOString();

  const deleteIds = formData.getAll("deleteImageId").map(Number).filter(Boolean);
  const existingImages = await db.query.articleImages.findMany({
    where: eq(articleImages.articleId, id),
    columns: { id: true },
  });
  const remaining = existingImages.filter((img) => !deleteIds.includes(img.id)).length;
  if (remaining + galleryUrls.length > MAX_GALLERY_IMAGES) {
    return { error: `La galleria può avere al massimo ${MAX_GALLERY_IMAGES} immagini.` };
  }

  // Cancella le immagini segnate per la rimozione (solo di questo articolo), dopo i controlli:
  // con un errore di validazione la modifica non resta a metà
  if (deleteIds.length > 0) {
    await db
      .delete(articleImages)
      .where(and(inArray(articleImages.id, deleteIds), eq(articleImages.articleId, id)));
  }

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

  if (justPublished && (await claimArticlePush(id))) {
    // dopo la risposta: su Vercel l'invio non si interrompe con il redirect
    after(() => deliverPush({
      title: title,
      body: excerpt || "Leggi la notizia sul sito della parrocchia.",
      url: `/news/${current.slug}`,
    }));
  }

  // Aggiunge nuove immagini galleria
  if (galleryUrls.length > 0) {
    const nextPosition = remaining;
    await db.insert(articleImages).values(
      galleryUrls.map((url, i) => ({ articleId: id, url, position: nextPosition + i }))
    );
  }

  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath(`/news/${current.slug}`);
  redirect("/admin/articoli");
}

/** Eliminare spetta solo a superadmin e owner, anche per i contenuti creati da editor e admin. */
export async function deleteArticle(id: number) {
  await requireSuperAdmin();
  const row = await db.query.articles.findFirst({ where: eq(articles.id, id), columns: { slug: true } });
  await db.delete(articleImages).where(eq(articleImages.articleId, id));
  await db.delete(articles).where(eq(articles.id, id));
  await db.delete(settings).where(eq(settings.key, `article_push:${id}`));
  if (row) revalidatePath(`/news/${row.slug}`);
  revalidatePath("/");
  revalidatePath("/news");
  revalidatePath("/admin/articoli");
}
