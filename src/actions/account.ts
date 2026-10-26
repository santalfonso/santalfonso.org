"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/auth";
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
    if (error instanceof AuthError) {
      return { error: "Email o password non corretti." };
    }
    throw error;
  }
}

export async function logoutSiteAction() {
  await signOut({ redirectTo: "/" });
}
