"use server";

import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError, CredentialsSignin } from "next-auth";
import { auth, forgetUserCheck, isStaff, signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isLimited, recordFailure, resetFailures } from "@/lib/rate-limit";
import { safeNext } from "@/lib/safe-next";

export type SiteLoginState = { error?: string } | undefined;

export async function loginSiteAction(
  _prev: SiteLoginState,
  formData: FormData
): Promise<SiteLoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Inserisci email e password." };
  }
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: safeNext(formData.get("next")),
    });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "too_many_attempts") {
      return { error: "Troppi tentativi falliti: riprova tra qualche minuto." };
    }
    // credenziali sbagliate; ogni altro errore (es. database irraggiungibile) non è colpa di chi accede
    if (error instanceof CredentialsSignin) {
      return { error: "Email o password non corretti." };
    }
    if (error instanceof AuthError) {
      return { error: "Accesso non riuscito per un problema momentaneo: riprova tra poco." };
    }
    throw error;
  }
}

export async function logoutSiteAction() {
  await signOut({ redirectTo: "/" });
}

export type PasswordState = { error?: string } | undefined;

const PASSWORD_WINDOW_MS = 15 * 60 * 1000;
const MAX_PASSWORD_FAILS = 5;

/**
 * Cambio della propria password: serve quella attuale. Le altre sessioni dell'utente
 * si chiudono da sole (l'impronta della password nel token non coincide più),
 * questa invece riparte subito con un nuovo accesso.
 */
export async function changePasswordAction(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const session = await auth();
  const id = Number(session?.user?.id);
  if (!Number.isSafeInteger(id) || id <= 0) return { error: "La sessione è scaduta: accedi di nuovo." };

  const current = formData.get("current");
  const next = formData.get("password");
  const again = formData.get("again");
  if (typeof current !== "string" || typeof next !== "string" || typeof again !== "string" || !current) {
    return { error: "Compila tutti i campi." };
  }
  const min = isStaff(session?.user?.role) ? 12 : 8;
  if (next.length < min) return { error: `La nuova password deve avere almeno ${min} caratteri.` };
  if (next.length > 200) return { error: "La nuova password è troppo lunga." };
  if (next !== again) return { error: "Le due nuove password non coincidono." };
  if (next === current) return { error: "La nuova password deve essere diversa da quella attuale." };

  const key = `password:${id}`;
  if (isLimited(key, MAX_PASSWORD_FAILS)) return { error: "Troppi tentativi: riprova tra qualche minuto." };

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { email: true, passwordHash: true },
  });
  if (!user) return { error: "La sessione è scaduta: accedi di nuovo." };
  if (!(await compare(current, user.passwordHash))) {
    recordFailure(key, PASSWORD_WINDOW_MS);
    return { error: "La password attuale non è corretta." };
  }
  resetFailures(key);

  await db.update(users).set({ passwordHash: await hash(next, 12) }).where(eq(users.id, id));
  forgetUserCheck(id);
  // nuovo accesso con la nuova password: il token di questa sessione resta valido
  await signIn("credentials", { email: user.email, password: next, redirectTo: "/area?esito=password-cambiata" });
}
