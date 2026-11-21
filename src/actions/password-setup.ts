"use server";

import { hash } from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clientIpFromHeaders, forgetUserCheck, loginFailureKeys, signIn } from "@/auth";
import { db } from "@/db";
import { passwordTokens, users } from "@/db/schema";
import { findValidToken, minPasswordLength } from "@/lib/password-token";
import { resetFailures } from "@/lib/rate-limit";
import { roleAtLeast } from "@/lib/roles";

export type SetPasswordState = { error?: string } | undefined;

/** Scelta della password dal link monouso dell'email; poi l'accesso è automatico. */
export async function setPasswordWithToken(_prev: SetPasswordState, formData: FormData): Promise<SetPasswordState> {
  const owner = await findValidToken(formData.get("t"));
  if (!owner) return { error: "Il link non è valido o è scaduto: chiedi un nuovo link all'amministratore del sito." };

  const password = formData.get("password");
  const again = formData.get("again");
  if (typeof password !== "string" || typeof again !== "string" || !password) return { error: "Scrivi la password due volte." };
  const min = minPasswordLength(owner.role);
  if (password.length < min) return { error: `La password deve avere almeno ${min} caratteri.` };
  if (password.length > 200) return { error: "La password può avere al massimo 200 caratteri." };
  if (password !== again) return { error: "Le due password non coincidono." };

  // il link vale una volta sola: lo si segna come usato prima di cambiare la password
  const claimed = await db
    .update(passwordTokens)
    .set({ usedAt: new Date().toISOString() })
    .where(and(eq(passwordTokens.id, owner.tokenId), isNull(passwordTokens.usedAt)))
    .returning({ id: passwordTokens.id });
  if (claimed.length === 0) return { error: "Questo link è già stato usato: accedi con la tua password." };

  await db.update(users).set({ passwordHash: await hash(password, 12) }).where(eq(users.id, owner.userId));
  forgetUserCheck(owner.userId);
  const keys = loginFailureKeys(owner.email, clientIpFromHeaders(await headers()));
  resetFailures(keys.emailIp);
  resetFailures(keys.ip);

  const destination = roleAtLeast(owner.role, "editor") ? "/admin" : "/area?esito=password-impostata";
  try {
    await signIn("credentials", { email: owner.email, password, redirectTo: destination });
  } catch (error) {
    // password salvata ma accesso automatico non riuscito: si accede dalla pagina Accedi
    if (error instanceof AuthError) redirect("/accedi?esito=password-impostata");
    throw error;
  }
  return undefined;
}
