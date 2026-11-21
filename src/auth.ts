import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createHash } from "node:crypto";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isLimited, recordFailure, resetFailures } from "@/lib/rate-limit";
import { roleAtLeast, type Role } from "@/lib/roles";

export { ROLE_LABEL, roleAtLeast, type Role } from "@/lib/roles";

declare module "next-auth" {
  interface User {
    role?: Role;
    /** Impronta della password al momento dell'accesso (vedi passwordStamp). */
    pwv?: string;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: Role;
    };
  }
}

/** Hash fittizio: confronto anche se l'email non esiste, per non rivelarlo dai tempi di risposta. */
const DUMMY_HASH = "$2b$10$scKt03rKLhzDJ7sJtZ/uFe255QuVDyjS1xEhOeW/5qs6BHMouqs8u";

/** Tentativi di login falliti consentiti per finestra (per email e per IP). */
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_EMAIL = 8;
const MAX_FAILS_PER_IP = 30;

/** Ogni quanto ricontrollare nel DB che l'utente del token esista ancora e il suo ruolo. */
const RECHECK_MS = 60 * 1000;

export class TooManyAttempts extends CredentialsSignin {
  code = "too_many_attempts";
}

function clientIp(request: Request | undefined): string {
  const fwd = request?.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? request?.headers.get("x-real-ip") ?? "unknown").trim().slice(0, 64);
}

type CurrentUser = { name: string; email: string; role: Role; stamp: string };

/**
 * Impronta breve dell'hash della password, salvata nel token di sessione: quando la
 * password cambia, le sessioni aperte altrove non coincidono più e vengono chiuse.
 */
export function passwordStamp(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("base64url").slice(0, 16);
}

// Nelle pagine il cookie della sessione non si può riscrivere, quindi `checkedAt`
// resta vecchio e il controllo scatterebbe a ogni richiesta: lo si memorizza per
// istanza, così si fa al massimo una query per utente ogni RECHECK_MS.
const userCheckCache = new Map<number, { at: number; row: CurrentUser | null }>();

async function currentUser(id: number): Promise<CurrentUser | null> {
  const hit = userCheckCache.get(id);
  if (hit && Date.now() - hit.at < RECHECK_MS) return hit.row;
  const found = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { name: true, email: true, role: true, passwordHash: true },
  });
  const row = found
    ? { name: found.name, email: found.email, role: found.role, stamp: passwordStamp(found.passwordHash) }
    : null;
  if (userCheckCache.size > 1000) userCheckCache.clear();
  userCheckCache.set(id, { at: Date.now(), row });
  return row;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string" || !email || !password) return null;
        if (email.length > 254 || password.length > 200) return null;

        const normEmail = email.toLowerCase().trim();
        const emailKey = `login:email:${normEmail}`;
        const ipKey = `login:ip:${clientIp(request)}`;
        if (isLimited(emailKey, MAX_FAILS_PER_EMAIL) || isLimited(ipKey, MAX_FAILS_PER_IP)) {
          throw new TooManyAttempts();
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, normEmail),
        });
        const valid = await compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) {
          recordFailure(emailKey, LOGIN_WINDOW_MS);
          recordFailure(ipKey, LOGIN_WINDOW_MS);
          return null;
        }
        resetFailures(emailKey);

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          pwv: passwordStamp(user.passwordHash),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.pwv = user.pwv;
        token.checkedAt = Date.now();
        return token;
      }
      // Il ruolo nel token non è definitivo: se l'admin elimina l'utente o ne
      // cambia il ruolo, la sessione si adegua entro RECHECK_MS.
      const id = Number(token.id);
      if (!Number.isSafeInteger(id) || id <= 0) return null;
      if (typeof token.checkedAt === "number" && Date.now() - token.checkedAt < RECHECK_MS) return token;
      const row = await currentUser(id);
      if (!row) return null; // utente eliminato: sessione invalidata
      // password cambiata (o token di prima di questo controllo): bisogna rientrare
      if (token.pwv !== row.stamp) return null;
      token.role = row.role;
      token.name = row.name;
      token.email = row.email;
      token.checkedAt = Date.now();
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role | undefined;
        session.user.id = (token.id as string | undefined) ?? "";
      }
      return session;
    },
  },
});

/** Accesso all'area di amministrazione: editor e ruoli superiori. */
export function isStaff(role: Role | undefined) {
  return roleAtLeast(role, "editor");
}

/** Avvisi (per articoli ed eventi l'admin ha gli stessi limiti dell'editor). */
export function isAdmin(role: Role | undefined) {
  return roleAtLeast(role, "admin");
}

/**
 * Modifica di un articolo o di un evento: superadmin e owner sempre; editor e admin solo se
 * l'hanno creato loro (i contenuti di prima dei ruoli, senza autore, restano a superadmin e owner).
 */
export function canEditContent(user: { id?: string; role?: Role }, createdBy: number | null): boolean {
  if (isSuperAdmin(user.role)) return true;
  return isStaff(user.role) && createdBy !== null && createdBy === Number(user.id);
}

/** Risorse, canti, utenti e gestione completa di articoli ed eventi. */
export function isSuperAdmin(role: Role | undefined) {
  return roleAtLeast(role, "superadmin");
}

/** Solo l'owner gestisce le impostazioni. */
export function isOwner(role: Role | undefined) {
  return role === "owner";
}

/** Qualsiasi utente autenticato, compresi gli utenti registrati senza accesso all'admin. */
/** Dopo un cambio di password questa istanza smette subito di fidarsi del ruolo in memoria. */
export function forgetUserCheck(id: number) {
  userCheckCache.delete(id);
}

export async function requireMember() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorizzato");
  return session.user;
}

/** Per le azioni: almeno il ruolo indicato, altrimenti errore. */
async function requireRole(min: Role) {
  const user = await requireMember();
  if (!roleAtLeast(user.role, min)) throw new Error("Non autorizzato");
  return user;
}

/** Accesso all'area di amministrazione (editor e superiori). */
export async function requireStaff() {
  return requireRole("editor");
}

export async function requireAdmin() {
  return requireRole("admin");
}

export async function requireSuperAdmin() {
  return requireRole("superadmin");
}

/**
 * Per le pagine dell'admin: il controllo nel layout non basta (i layout non
 * vengono rieseguiti a ogni navigazione), quindi ogni pagina lo ripete.
 */
export async function requireStaffPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  if (!isStaff(session.user.role)) redirect("/lodate");
  return session.user;
}

export async function requireOwner() {
  const user = await requireMember();
  if (!isOwner(user.role)) throw new Error("Riservato all'owner");
  return user;
}

/** Per le pagine riservate a un ruolo: chi non lo ha torna alla dashboard. */
async function requireRolePage(min: Role) {
  const user = await requireStaffPage();
  if (!roleAtLeast(user.role, min)) redirect("/admin");
  return user;
}

/** Pagine di Risorse, Canti e Utenti. */
export async function requireSuperAdminPage() {
  return requireRolePage("superadmin");
}

/** Pagine delle Impostazioni. */
export async function requireOwnerPage() {
  return requireRolePage("owner");
}
