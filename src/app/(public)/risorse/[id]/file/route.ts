import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resource = await db.query.resources.findFirst({
    where: eq(resources.id, parseInt(id, 10)),
  });

  if (!resource) {
    return new Response("Not found", { status: 404 });
  }

  const upstream = await fetch(resource.fileUrl);
  if (!upstream.ok) {
    return new Response("File non disponibile", { status: 502 });
  }

  const contentType =
    upstream.headers.get("Content-Type") ?? "application/octet-stream";

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${resource.fileName}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
