"use server";

import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/auth";
import type { ActionState } from "./articles";

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof CredentialsSignin && error.code === "too_many_attempts") {
      return { error: "Troppi tentativi falliti: riprova tra qualche minuto." };
    }
    // credenziali sbagliate; ogni altro errore (es. database irraggiungibile) non è colpa di chi accede
    if (error instanceof CredentialsSignin) {
      return { error: "Email o password non corretti" };
    }
    if (error instanceof AuthError) {
      return { error: "Accesso non riuscito per un problema momentaneo: riprova tra poco." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
