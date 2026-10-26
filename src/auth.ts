import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isLimited, recordFailure, resetFailures } from "@/lib/rate-limit";

export type Role = "admin" | "editor" | "utente";

declare module "next-auth" {
  interface User {
    role?: Role;
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.checkedAt = Date.now();
        return token;
      }
      // Il ruolo nel token non è definitivo: se l'admin elimina l'utente o ne
      // cambia il ruolo, la sessione si adegua entro RECHECK_MS.
      const id = Number(token.id);
      if (!Number.isSafeInteger(id) || id <= 0) return null;
      if (typeof token.checkedAt === "number" && Date.now() - token.checkedAt < RECHECK_MS) return token;
      const row = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: { name: true, email: true, role: true },
      });
      if (!row) return null; // utente eliminato: sessione invalidata
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

export function isStaff(role: Role | undefined) {
  return role === "admin" || role === "editor";
}

/** Qualsiasi utente autenticato, compresi gli utenti registrati senza accesso all'admin. */
export async function requireMember() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non autorizzato");
  return session.user;
}

/** Admin o editor: accesso all'area di amministrazione. */
export async function requireStaff() {
  const user = await requireMember();
  if (!isStaff(user.role)) throw new Error("Non autorizzato");
  return user;
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

export async function requireAdmin() {
  const user = await requireMember();
  if (user.role !== "admin") throw new Error("Riservato agli amministratori");
  return user;
}
