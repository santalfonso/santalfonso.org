import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { contentDisposition, fileDelivery, isOwnCloudinaryUrl } from "@/lib/resource-file";

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

  let upstream: Response;
  try {
    upstream = await fetch(resource.fileUrl, { redirect: "error", signal: AbortSignal.timeout(20_000) });
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
      "Cache-Control": "public, max-age=86400",
    },
  });
}
