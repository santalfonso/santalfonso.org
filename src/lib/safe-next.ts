const DEFAULT_NEXT = "/area";

/**
 * Destinazione dopo l'accesso: accetta solo percorsi interni relativi del sito ("/…").
 * Rifiuta URL assoluti, protocol-relative (//), backslash e caratteri di controllo.
 */
export function safeNext(value: unknown): string {
  const v = Array.isArray(value) ? value[0] : value;
  if (typeof v !== "string" || v.length > 2000) return DEFAULT_NEXT;
  if (!v.startsWith("/") || v.startsWith("/accedi")) return DEFAULT_NEXT;
  if (/[\\\u0000-\u001F\u007F]/.test(v) || v.includes("//")) return DEFAULT_NEXT;
  return v;
}
