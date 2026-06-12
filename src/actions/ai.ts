"use server";

import { getSetting } from "./settings";

type AIResult = { data: string } | { error: string };

async function callGroq(system: string, user: string): Promise<AIResult> {
  const apiKey = await getSetting("groq_api_key");
  if (!apiKey) {
    return {
      error:
        "Chiave API Groq non configurata. Vai in Configurazioni per aggiungerla.",
    };
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
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });
  } catch (e) {
    return { error: `Errore di rete: ${e instanceof Error ? e.message : e}` };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { error: `Groq ha risposto con errore ${res.status}: ${body}` };
  }

  const json = await res.json();
  const content: string = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!content) return { error: "Risposta vuota dall'API Groq." };
  return { data: content };
}

export async function proofreadText(text: string): Promise<AIResult> {
  if (!text.trim())
    return { error: "Inserisci del testo prima di eseguire la correzione." };

  return callGroq(
    "Sei un correttore di bozze per testi parrocchiali italiani. " +
      "Correggi errori grammaticali e ortografici, migliora la leggibilità " +
      "mantenendo tono, contenuto e lunghezza originali. " +
      "Restituisci solo il testo corretto, senza commenti o spiegazioni.",
    text,
  );
}

export async function generateTitle(text: string): Promise<AIResult> {
  if (!text.trim())
    return {
      error: "Inserisci il testo dell'articolo prima di generare il titolo.",
    };

  return callGroq(
    "Sei un redattore per una parrocchia cattolica italiana. " +
      "Genera un titolo breve, chiaro e pertinente per il seguente articolo. " +
      "Restituisci solo il titolo, senza virgolette, numeri o altri caratteri aggiuntivi.",
    text,
  );
}

export async function generateExcerpt(text: string): Promise<AIResult> {
  if (!text.trim())
    return {
      error:
        "Inserisci il testo dell'articolo prima di generare il sommario.",
    };

  return callGroq(
    "Sei un redattore per una parrocchia cattolica italiana. " +
      "Scrivi un sommario conciso di 2-3 frasi adatto a essere mostrato in un elenco articoli. " +
      "Restituisci solo il sommario, senza titolo, numeri o virgolette.",
    text,
  );
}
