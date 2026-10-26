import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";

/**
 * Legge un'impostazione (es. chiavi API). Solo lato server: NON va esportata
 * da un file "use server", altrimenti diventa un endpoint pubblico.
 */
export async function getSetting(key: string): Promise<string | null> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? null;
}
