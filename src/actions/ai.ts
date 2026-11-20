"use server";

import { requireStaff } from "@/auth";
import { groqChat } from "@/lib/groq";

type AIResult = { data: string } | { error: string };

async function callGroq(system: string, user: string): Promise<AIResult> {
  try {
    await requireStaff();
  } catch {
    return { error: "Non autorizzato." };
  }
  if (user.length > 50_000) return { error: "Testo troppo lungo." };
  return groqChat({ system, user });
}

export async function proofreadText(text: string): Promise<AIResult> {
  if (!text.trim())
    return { error: "Inserisci del testo prima di eseguire la correzione." };

  const isHtml = /<[a-z][\s\S]*>/i.test(text);
  return callGroq(
    "Sei un correttore di bozze per testi parrocchiali italiani. " +
      "Correggi errori grammaticali e ortografici, migliora la leggibilità " +
      "mantenendo tono, contenuto e lunghezza originali. " +
      (isHtml
        ? "Il testo è in HTML: correggi solo le parole visibili e lascia identici tutti i tag e gli attributi " +
          "(paragrafi, titoli, elenchi, link, grassetti, allineamenti), senza aggiungerne di nuovi. " +
          "Restituisci solo l'HTML corretto, senza ``` né commenti o spiegazioni."
        : "Restituisci solo il testo corretto, senza commenti o spiegazioni."),
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

export async function proofreadAnnouncement(
  title: string,
  text: string,
): Promise<
  | { correctedTitle: string; correctedText: string; hasChanges: boolean }
  | { error: string }
> {
  const result = await callGroq(
    "Sei un correttore di bozze per avvisi parrocchiali italiani. " +
      "Correggi TUTTI gli errori ortografici, grammaticali, punteggiatura e uso delle maiuscole. " +
      "Presta particolare attenzione alle lettere duplicate o triplicate per errore (es. 'Parrrocchiale' → 'Parrocchiale', 'messa' scritto 'messsa'). " +
      "Scrivi gli orari nel formato HH:mm a due cifre solo quando il numero è chiaramente un orario (es. 'alle 9' → 'alle 09:00', 'ore 9.30' → 'ore 09:30'); " +
      "non toccare date, giorni del mese e altri numeri (es. 'domenica 9 novembre' resta così). " +
      "Rimani fedele all'originale: non aggiungere, rimuovere o riformulare informazioni. " +
      'Rispondi SOLO con un oggetto JSON valido nel formato: {"title": "...", "text": "..."}',
    `Titolo: ${title}\nTesto: ${text}`,
  );

  if ("error" in result) return result;

  const jsonMatch = result.data.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { correctedTitle: title, correctedText: text, hasChanges: false };

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const correctedTitle: string = parsed.title ?? title;
    const correctedText: string = parsed.text ?? text;
    return {
      correctedTitle,
      correctedText,
      hasChanges:
        correctedTitle.trim() !== title.trim() ||
        correctedText.trim() !== text.trim(),
    };
  } catch {
    return { correctedTitle: title, correctedText: text, hasChanges: false };
  }
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

export type EventTexts = { title: string; location: string; description: string };

/** Correzione dei testi di un evento: titolo, luogo e descrizione insieme. */
export async function proofreadEvent(texts: EventTexts): Promise<{ data: EventTexts } | { error: string }> {
  if (!texts.title.trim() && !texts.description.trim())
    return { error: "Scrivi almeno il titolo o la descrizione prima della correzione." };

  const result = await callGroq(
    "Sei un correttore di bozze per gli eventi di una parrocchia cattolica italiana. " +
      "Correggi errori ortografici, grammaticali, di punteggiatura e di maiuscole in titolo, luogo e descrizione. " +
      "Ogni campo inizia con la lettera maiuscola; i nomi propri di luoghi, santi e persone hanno le iniziali maiuscole " +
      "(es. 'salone don bosco' → 'Salone Don Bosco', 'concerto di natale' → 'Concerto di Natale'). " +
      "Non aggiungere, togliere o riformulare informazioni e non inventare dettagli. Un campo vuoto resta vuoto. " +
      'Rispondi SOLO con un oggetto JSON valido nel formato: {"title": "...", "location": "...", "description": "..."}',
    JSON.stringify(texts),
  );
  if ("error" in result) return result;

  try {
    const parsed = JSON.parse(result.data.match(/\{[\s\S]*\}/)?.[0] ?? "");
    const pick = (key: keyof EventTexts) =>
      typeof parsed[key] === "string" && texts[key].trim() ? parsed[key].trim() : texts[key];
    return { data: { title: pick("title"), location: pick("location"), description: pick("description") } };
  } catch {
    return { error: "Risposta dell'AI non valida: riprova." };
  }
}
