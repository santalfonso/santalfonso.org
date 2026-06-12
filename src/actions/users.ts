"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { ActionState } from "./articles";

const userSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
  role: z.enum(["admin", "editor"]),
});

export async function createUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password, role } = parsed.data;
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
  if (existing) return { error: "Esiste già un utente con questa email" };

  await db.insert(users).values({
    name,
    email: email.toLowerCase(),
    passwordHash: await hash(password, 10),
    role,
  });

  redirect("/admin/utenti");
}

export async function deleteUser(id: number) {
  const admin = await requireAdmin();
  if (String(id) === admin.id) {
    throw new Error("Non puoi eliminare il tuo stesso account");
  }
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/utenti");
}
