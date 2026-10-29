import { getSetting } from "@/lib/settings";

/**
 * Chiamata a Groq (API compatibile OpenAI) con la chiave salvata in Configurazioni.
 * Solo lato server: NON va esportata da un file "use server".
 */
export type GroqResult = { data: string } | { error: string };

/** Modello attivo su Groq (llama-3.3-70b-versatile è stato ritirato). */
const MODEL = "openai/gpt-oss-120b";

export async function groqChat({
  system,
  user,
  json = false,
  temperature = 0.3,
  maxTokens = 2048,
}: {
  system: string;
  user: string;
  /** Chiede una risposta in JSON valido. */
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
}): Promise<GroqResult> {
  const apiKey = await getSetting("groq_api_key");
  if (!apiKey) {
    return { error: "Chiave API Groq non configurata. Vai in Configurazioni per aggiungerla." };
  }

  let res: Response;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature,
        // il modello ragiona prima di rispondere: poco ragionamento, e spazio per la risposta
        reasoning_effort: "low",
        max_completion_tokens: maxTokens + 1024,
        ...(json ? { response_format: { type: "json_object" } } : {}),
      }),
      signal: AbortSignal.timeout(45_000),
    });
  } catch (e) {
    return { error: `Errore di rete: ${e instanceof Error ? e.message : e}` };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { error: `Groq ha risposto con errore ${res.status}: ${body}` };
  }

  const out = await res.json();
  const content: string = out.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) return { error: "Risposta vuota dall'API Groq." };
  return { data: content };
}
