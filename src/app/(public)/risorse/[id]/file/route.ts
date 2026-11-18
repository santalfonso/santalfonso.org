import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resourceCategories, resources } from "@/db/schema";
import { contentDisposition, fileDelivery, isOwnCloudinaryUrl, serverDownloadUrl } from "@/lib/resource-file";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }
  const resource = await db.query.resources.findFirst({
    where: eq(resources.id, Number(id)),
  });

  // solo file caricati sul Cloudinary della parrocchia
  if (!resource || !isOwnCloudinaryUrl(resource.fileUrl)) {
    return new Response("Not found", { status: 404 });
  }
  // i file di una categoria nascosta non si scaricano
  if (resource.categoryId !== null) {
    const category = await db.query.resourceCategories.findFirst({
      where: eq(resourceCategories.id, resource.categoryId),
      columns: { active: true },
    });
    if (category && !category.active) return new Response("Not found", { status: 404 });
  }

  const source = await serverDownloadUrl(resource.fileUrl);
  if (!source) {
    return new Response("Not found", { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(source, { redirect: "error", cache: "no-store", signal: AbortSignal.timeout(30_000) });
  } catch {
    return new Response("File non disponibile", { status: 502 });
  }
  if (!upstream.ok) {
    return new Response("File non disponibile", { status: 502 });
  }

  const { contentType, inline } = fileDelivery(resource.fileName, resource.fileUrl);

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition(resource.fileName, inline),
      "X-Content-Type-Options": "nosniff",
      ...(upstream.headers.get("content-length") ? { "Content-Length": upstream.headers.get("content-length")! } : {}),
      "Cache-Control": "public, max-age=86400",
    },
  });
}
