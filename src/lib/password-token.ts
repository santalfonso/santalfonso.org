import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordTokens, users } from "@/db/schema";
import { roleAtLeast, type Role } from "@/lib/roles";

/**
 * Link monouso per scegliere la password. Solo server: non va esportato da un file "use server".
 * Nel database c'è solo l'impronta del token, quindi chi legge il database non può usare i link.
 */
export const PASSWORD_LINK_DAYS = 7;

export function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Crea un link nuovo ed elimina quelli precedenti non ancora usati dello stesso utente. */
export async function createPasswordToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await db
    .delete(passwordTokens)
    .where(and(eq(passwordTokens.userId, userId), isNull(passwordTokens.usedAt)));
  await db.insert(passwordTokens).values({
    userId,
    tokenHash: tokenHash(token),
    expiresAt: new Date(now.getTime() + PASSWORD_LINK_DAYS * 86_400_000).toISOString(),
  });
  return token;
}

export type TokenOwner = { tokenId: number; userId: number; name: string; email: string; role: Role };

/** Proprietario di un token valido (non usato, non scaduto), altrimenti null. */
export async function findValidToken(token: unknown): Promise<TokenOwner | null> {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const [row] = await db
    .select({
      tokenId: passwordTokens.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(passwordTokens)
    .innerJoin(users, eq(users.id, passwordTokens.userId))
    .where(
      and(
        eq(passwordTokens.tokenHash, tokenHash(token)),
        isNull(passwordTokens.usedAt),
        gt(passwordTokens.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1);
  return row ?? null;
}

/** Lunghezza minima della password: 12 per chi entra nell'amministrazione, 8 per un user. */
export function minPasswordLength(role: Role): number {
  return roleAtLeast(role, "editor") ? 12 : 8;
}

/** Indirizzo del sito dalla richiesta in corso (anche in locale e sulle anteprime). */
export function siteOrigin(h: Headers): string {
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.santalfonso.org";
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
  const proto = h.get("x-forwarded-proto") ?? (local ? "http" : "https");
  return `${proto}://${host}`;
}
