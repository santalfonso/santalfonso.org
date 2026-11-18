"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireOwner } from "@/auth";
import { GITHUB_TOKEN_KEY, GithubError, verifyToken } from "@/lib/github-updates";

/** Chiavi modificabili da questo modulo (le altre impostazioni hanno le loro azioni). */
const EDITABLE_KEYS = new Set(["groq_api_key", GITHUB_TOKEN_KEY]);

export type SettingState = { error?: string; success?: boolean } | undefined;

export async function saveSetting(
  _prev: SettingState,
  formData: FormData,
): Promise<SettingState> {
  try {
    await requireOwner();
  } catch {
    return { error: "Non autorizzato." };
  }

  const key = String(formData.get("key") ?? "");
  const value = String(formData.get("value") ?? "").trim();

  if (!EDITABLE_KEYS.has(key)) return { error: "Impostazione non valida." };
  if (!value) return { error: "Inserisci un valore." };

  if (key === GITHUB_TOKEN_KEY) {
    if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{20,}$/.test(value)) {
      return { error: "Non sembra un token GitHub: deve iniziare con github_pat_." };
    }
    // si salva solo un token che funziona davvero
    try {
      await verifyToken(value);
    } catch (e) {
      return { error: e instanceof GithubError ? e.message : "Impossibile verificare il token con GitHub: riprova." };
    }
  }

  await db
    .insert(settings)
    .values({ key, value, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date().toISOString() },
    });

  revalidatePath("/admin/impostazioni/configurazioni");
  revalidatePath("/admin/impostazioni/aggiornamenti");
  return { success: true };
}
