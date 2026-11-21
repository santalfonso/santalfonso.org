/**
 * Collegamento a GitHub Actions per il pulsante "Applica aggiornamenti" (solo lato server).
 * Il token è un fine-grained token salvato in Configurazioni con il solo permesso
 * "Actions: lettura e scrittura" sul repository del sito.
 */
import { getSecretSetting } from "@/lib/settings";

export const GITHUB_TOKEN_KEY = "github_token";
export const WORKFLOW_FILE = "aggiorna-dipendenze.yml";

/** Repository del sito: su Vercel arriva dalle variabili di sistema, altrimenti quello noto. */
export function repoSlug(): string {
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const slug = process.env.VERCEL_GIT_REPO_SLUG;
  return owner && slug ? `${owner}/${slug}` : "santalfonso/santalfonso.org";
}

export class GithubError extends Error {}

async function github(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com/repos/${repoSlug()}${path}`, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sito-parrocchia",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (res.status === 401) throw new GithubError("Il token GitHub non è valido o è scaduto: aggiornalo in Configurazioni.");
  if (res.status === 403 || res.status === 404) {
    throw new GithubError(
      "Il token GitHub non ha accesso alle Actions del repository (serve il permesso \"Actions: lettura e scrittura\"), oppure l'automazione non è ancora pubblicata.",
    );
  }
  if (!res.ok) throw new GithubError(`GitHub ha risposto con un errore (${res.status}). Riprova tra qualche minuto.`);
  return res;
}

export async function getGithubToken(): Promise<string | null> {
  return getSecretSetting(GITHUB_TOKEN_KEY);
}

/** Controlla che il token possa leggere le Actions del repository (usato al salvataggio). */
export async function verifyToken(token: string): Promise<void> {
  await github("/actions/workflows?per_page=1", token);
}

export type UpdateRun = {
  id: number;
  status: "queued" | "in_progress" | "completed" | string;
  conclusion: string | null;
  createdAt: string;
  url: string;
  /** Solo per le esecuzioni riuscite: true se ha pubblicato delle modifiche, false se non c'era niente da fare. */
  published: boolean | null;
};

/** Ultime esecuzioni dell'automazione, dalla più recente. */
export async function listUpdateRuns(token: string, limit = 5): Promise<UpdateRun[]> {
  const res = await github(`/actions/workflows/${WORKFLOW_FILE}/runs?per_page=${limit}`, token);
  const data = (await res.json()) as {
    workflow_runs: { id: number; status: string; conclusion: string | null; created_at: string; html_url: string }[];
  };
  const runs: UpdateRun[] = data.workflow_runs.map((r) => ({
    id: r.id,
    status: r.status,
    conclusion: r.conclusion,
    createdAt: r.created_at,
    url: r.html_url,
    published: null,
  }));
  // per l'ultima riuscita: il passo "Pubblica" è stato eseguito o saltato (nessuna modifica)?
  const lastOk = runs.find((r) => r.status === "completed" && r.conclusion === "success");
  if (lastOk) {
    try {
      const jobs = (await (await github(`/actions/runs/${lastOk.id}/jobs`, token)).json()) as {
        jobs: { steps?: { name: string; conclusion: string | null }[] }[];
      };
      const step = jobs.jobs.flatMap((j) => j.steps ?? []).find((s) => s.name === "Pubblica");
      lastOk.published = step ? step.conclusion === "success" : null;
    } catch {
      // il dettaglio è facoltativo: senza, si mostra solo "completato"
    }
  }
  return runs;
}

/** Avvia l'automazione sul ramo principale. */
export async function startUpdateRun(token: string): Promise<void> {
  await github(`/actions/workflows/${WORKFLOW_FILE}/dispatches`, token, {
    method: "POST",
    body: JSON.stringify({ ref: "main" }),
  });
}
