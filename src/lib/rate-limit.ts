/**
 * Limitatore semplice in memoria per i tentativi di login falliti.
 *
 * Limite: vive nella memoria della singola istanza del server (su Vercel ogni
 * istanza serverless ha il suo contatore e si azzera a ogni cold start), quindi
 * rallenta i tentativi a forza bruta ma non è una protezione assoluta.
 */

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
const MAX_KEYS = 10_000;

function prune(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  // se è ancora pieno, svuota (meglio perdere i contatori che crescere senza limite)
  if (buckets.size >= MAX_KEYS) buckets.clear();
}

/** true se la chiave ha superato `max` fallimenti nella finestra corrente. */
export function isLimited(key: string, max: number): boolean {
  const e = buckets.get(key);
  if (!e) return false;
  if (e.resetAt <= Date.now()) {
    buckets.delete(key);
    return false;
  }
  return e.count >= max;
}

/** Registra un fallimento per la chiave (finestra di `windowMs`). */
export function recordFailure(key: string, windowMs: number) {
  const now = Date.now();
  prune(now);
  const e = buckets.get(key);
  if (!e || e.resetAt <= now) buckets.set(key, { count: 1, resetAt: now + windowMs });
  else e.count += 1;
}

export function resetFailures(key: string) {
  buckets.delete(key);
}
