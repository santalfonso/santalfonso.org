"use server";

import { hash } from "bcryptjs";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { forgetUserCheck, requireSuperAdmin, roleAtLeast } from "@/auth";
import { canManageRole } from "@/lib/roles";
import { db } from "@/db";
import { favoriteSongs, passwordTokens, setlistItems, setlists, songAnnotations, songUserSettings, users } from "@/db/schema";
import type { ActionState } from "./articles";

const userSchema = z.object({
  name: z.string().trim().min(1, "Il nome è obbligatorio").max(100, "Nome troppo lungo"),
  email: z.string().trim().max(254, "Email troppo lunga").email("Email non valida"),
  password: z
    .string()
    .min(8, "La password deve avere almeno 8 caratteri")
    .max(200, "La password può avere al massimo 200 caratteri"),
  // l'owner si assegna solo dal database; chi crea può assegnare solo ruoli sotto il suo
  role: z.enum(["superadmin", "admin", "editor", "utente"], { message: "Scegli il ruolo" }),
});

export async function createUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const me = await requireSuperAdmin();
  const parsed = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, email, password, role } = parsed.data;
  if (!canManageRole(me.role, role)) return { error: "Non puoi assegnare questo ruolo" };
  // chi entra nell'amministrazione ha bisogno di una password più lunga
  if (roleAtLeast(role, "editor") && password.length < 12) {
    return { error: "Per chi accede all'amministrazione la password deve avere almeno 12 caratteri" };
  }
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email.toLowerCase()),
  });
  if (existing) return { error: "Esiste già un utente con questa email" };

  await db.insert(users).values({
    name,
    email: email.toLowerCase(),
    passwordHash: await hash(password, 12),
    role,
  });

  redirect("/admin/utenti");
}

export async function deleteUser(id: number) {
  const me = await requireSuperAdmin();
  if (String(id) === me.id) {
    throw new Error("Non puoi eliminare il tuo stesso account");
  }
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Utente non valido");
  const target = await db.query.users.findFirst({ where: eq(users.id, id), columns: { role: true } });
  if (!target) throw new Error("Utente non trovato");
  if (!canManageRole(me.role, target.role)) throw new Error("Non puoi eliminare un utente con questo ruolo");
  // Le FK hanno ON DELETE CASCADE, ma SQLite le applica solo se abilitate:
  // cancelliamo esplicitamente scalette (anche quelle condivise), preferiti, annotazioni e trasposizioni.
  await db.transaction(async (tx) => {
    const own = tx.select({ id: setlists.id }).from(setlists).where(eq(setlists.ownerId, id));
    await tx.delete(setlistItems).where(inArray(setlistItems.setlistId, own));
    await tx.delete(setlists).where(eq(setlists.ownerId, id));
    await tx.delete(favoriteSongs).where(eq(favoriteSongs.userId, id));
    await tx.delete(songAnnotations).where(eq(songAnnotations.userId, id));
    await tx.delete(songUserSettings).where(eq(songUserSettings.userId, id));
    await tx.delete(passwordTokens).where(eq(passwordTokens.userId, id));
    await tx.delete(users).where(eq(users.id, id));
  });
  forgetUserCheck(id);
  revalidatePath("/admin/utenti");
}
