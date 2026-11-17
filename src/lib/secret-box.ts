import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * Cifratura dei segreti salvati nel database (password SMTP, chiave segreta reCAPTCHA).
 * La chiave deriva da AUTH_SECRET: se AUTH_SECRET cambia, i segreti vanno reinseriti
 * da Configurazioni (la lettura restituisce null invece di un valore sbagliato).
 */
const PREFIX = "enc:v1:";

function key(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET mancante: impossibile cifrare i segreti");
  return createHash("sha256").update(`${secret}:settings-secret-box`).digest();
}

export function sealSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return PREFIX + Buffer.concat([iv, cipher.getAuthTag(), data]).toString("base64url");
}

export function openSecret(sealed: string | null): string | null {
  if (!sealed?.startsWith(PREFIX)) return null;
  try {
    const raw = Buffer.from(sealed.slice(PREFIX.length), "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
