/**
 * Verifica lato server dei token reCAPTCHA v3 (form contatti, richiesta di account).
 * Solo server: non va importata da un file "use server" come funzione esportata.
 */

/** Punteggio minimo (0 = robot, 1 = persona). */
const MIN_SCORE = 0.5;

/** Nome del sito senza porta e senza "www.", per confrontare il dominio di reCAPTCHA con quello della richiesta. */
function bareHost(host: string | null | undefined): string {
  return (host ?? "").toLowerCase().replace(/:\d+$/, "").replace(/^www\./, "");
}

/** Chiede a Google il giudizio sul token generato dalla pagina per l'azione indicata. */
export async function verifyRecaptcha(opts: {
  secret: string | null;
  token: string;
  action: string;
  ip: string;
  host: string | null;
  label: string;
}): Promise<boolean> {
  const { secret, token, action, ip, host, label } = opts;
  if (!secret || !token) {
    console.warn(`${label}: reCAPTCHA non configurato o token mancante`);
    return false;
  }
  const body = new URLSearchParams({ secret, response: token });
  if (ip !== "unknown") body.set("remoteip", ip);
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean; score?: number; action?: string; hostname?: string };
    // il token deve essere stato generato su questo sito (non su un'altra pagina con la stessa chiave)
    const ok =
      data.success === true &&
      data.action === action &&
      (data.score ?? 0) >= MIN_SCORE &&
      !!host &&
      bareHost(data.hostname) === bareHost(host);
    if (!ok) console.warn(`${label}: verifica reCAPTCHA non superata`, { score: data.score, action: data.action, hostname: data.hostname });
    return ok;
  } catch {
    return false;
  }
}
