"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/auth";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getSetting } from "@/lib/settings";
import { checkUpdates, parseReport, UPDATES_SETTING_KEY } from "@/lib/updates";

export type CheckState = { error?: string; done?: boolean } | undefined;

/** Pulsante "Verifica aggiornamenti": controlla e salva il risultato (solo owner). */
export async function runUpdatesCheck(): Promise<CheckState> {
  try {
    await requireOwner();
  } catch {
    return { error: "Non autorizzato." };
  }
  try {
    const previous = parseReport(await getSetting(UPDATES_SETTING_KEY));
    const report = await checkUpdates(previous);
    const value = JSON.stringify(report);
    const updatedAt = new Date().toISOString();
    await db
      .insert(settings)
      .values({ key: UPDATES_SETTING_KEY, value, updatedAt })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt } });
  } catch {
    return { error: "Verifica non riuscita: il registro dei pacchetti non risponde. Riprova tra qualche minuto." };
  }
  revalidatePath("/admin/impostazioni/aggiornamenti");
  return { done: true };
}
