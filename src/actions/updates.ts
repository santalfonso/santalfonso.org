"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/auth";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getSetting } from "@/lib/settings";
import { checkUpdates, parseReport, UPDATES_SETTING_KEY } from "@/lib/updates";
import { getGithubToken, GithubError, listUpdateRuns, startUpdateRun } from "@/lib/github-updates";

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

/** Pulsante "Applica aggiornamenti": avvia l'automazione su GitHub (solo owner). */
export async function applyCompatibleUpdates(): Promise<CheckState> {
  try {
    await requireOwner();
  } catch {
    return { error: "Non autorizzato." };
  }
  const token = await getGithubToken();
  if (!token) return { error: "Manca il token GitHub: inseriscilo in Impostazioni → Configurazioni." };
  try {
    const runs = await listUpdateRuns(token, 3);
    if (runs.some((r) => r.status !== "completed")) {
      return { error: "Un aggiornamento è già in corso: attendi che finisca." };
    }
    await startUpdateRun(token);
  } catch (e) {
    return { error: e instanceof GithubError ? e.message : "Non è stato possibile contattare GitHub. Riprova tra qualche minuto." };
  }
  revalidatePath("/admin/impostazioni/aggiornamenti");
  return { done: true };
}
