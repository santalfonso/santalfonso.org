import { z } from "zod";
import { ANNOTATION_MARKS, type Annotation } from "@/lib/lodate/constants";

const MARKS = ANNOTATION_MARKS.map((m) => m.mark) as [Annotation["mark"], ...Annotation["mark"][]];

export const annotationSchema = z.object({
  line: z.number().int().min(0).max(5000),
  col: z.number().int().min(0).max(2000),
  mark: z.enum(MARKS),
});

export const annotationsSchema = z.array(annotationSchema).max(2000);

/** Una sola annotazione per posizione (vince l'ultima), ordinate per riga e colonna. */
export function normalizeAnnotations(list: Annotation[]): Annotation[] {
  const byPos = new Map<string, Annotation>();
  for (const a of list) byPos.set(`${a.line}:${a.col}`, { line: a.line, col: a.col, mark: a.mark });
  return [...byPos.values()].sort((a, b) => a.line - b.line || a.col - b.col);
}

/** Legge il JSON salvato nel DB, scartando dati non validi. */
export function parseStoredAnnotations(json: string | null | undefined): Annotation[] {
  if (!json) return [];
  try {
    const parsed = annotationsSchema.safeParse(JSON.parse(json));
    return parsed.success ? normalizeAnnotations(parsed.data) : [];
  } catch {
    return [];
  }
}
