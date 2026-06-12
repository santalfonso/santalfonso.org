"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdmin } from "@/auth";

export type SettingState = { error?: string; success?: boolean } | undefined;

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? null;
}

export async function saveSetting(
  _prev: SettingState,
  formData: FormData,
): Promise<SettingState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Non autorizzato." };
  }

  const key = formData.get("key") as string;
  const value = (formData.get("value") as string).trim();

  if (!key) return { error: "Chiave mancante." };
  if (!value) return { error: "Inserisci un valore." };

  await db
    .insert(settings)
    .values({ key, value, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date().toISOString() },
    });

  revalidatePath("/admin/configurazioni");
  return { success: true };
}
