"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/auth";

export type LodateLoginState = { error?: string } | undefined;

const DEFAULT_NEXT = "/lodate/area";

/**
 * Accetta solo percorsi interni relativi dell'app (/lodate, /lodate/…, /lodate?…).
 * Rifiuta URL assoluti, protocol-relative (//), backslash e caratteri di controllo.
 */
function safeNext(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || value.length > 2000) return DEFAULT_NEXT;
  if (!/^\/lodate(?:[/?#]|$)/.test(value)) return DEFAULT_NEXT;
  if (/[\\\u0000-\u001F\u007F]/.test(value) || value.includes("//")) return DEFAULT_NEXT;
  return value;
}

export async function lodateLoginAction(
  _prev: LodateLoginState,
  formData: FormData
): Promise<LodateLoginState> {
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
    if (error instanceof AuthError) {
      return { error: "Email o password non corretti." };
    }
    throw error;
  }
}

export async function lodateLogoutAction() {
  await signOut({ redirectTo: "/lodate" });
}
