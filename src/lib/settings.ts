import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { openSecret } from "@/lib/secret-box";

/**
 * Legge un'impostazione (es. chiavi API). Solo lato server: NON va esportata
 * da un file "use server", altrimenti diventa un endpoint pubblico.
 */
export async function getSetting(key: string): Promise<string | null> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? null;
}

/**
 * Legge un segreto salvato cifrato con sealSecret. I valori salvati in chiaro prima della
 * cifratura (senza il prefisso "enc:") si leggono ancora così come sono, finché l'owner non
 * li salva di nuovo da Configurazioni.
 */
export async function getSecretSetting(key: string): Promise<string | null> {
  const value = await getSetting(key);
  if (!value) return null;
  return value.startsWith("enc:") ? openSecret(value) : value;
}
