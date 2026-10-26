export const MOMENTS = [
  { slug: "iniziale", label: "Canto iniziale" },
  { slug: "gloria", label: "Gloria" },
  { slug: "offertorio", label: "Offertorio" },
  { slug: "santo", label: "Santo" },
  { slug: "pace", label: "Pace" },
  { slug: "agnello", label: "Agnello di Dio" },
  { slug: "comunione", label: "Comunione" },
  { slug: "finale", label: "Canto finale" },
] as const;

export const SEASONS = [
  { slug: "avvento", label: "Avvento" },
  { slug: "natale", label: "Natale" },
  { slug: "ordinario", label: "Tempo ordinario" },
  { slug: "quaresima", label: "Quaresima" },
  { slug: "pasqua", label: "Pasqua" },
  { slug: "spirito-santo", label: "Spirito Santo" },
  { slug: "maria", label: "Maria" },
  { slug: "perdono", label: "Perdono" },
  { slug: "funerali", label: "Funerali" },
  { slug: "matrimoni", label: "Matrimoni" },
] as const;

export type Moment = (typeof MOMENTS)[number]["slug"];
export type Season = (typeof SEASONS)[number]["slug"];

/** Momento speciale con etichetta libera, solo nelle scalette. */
export const EXTRA_MOMENT = "extra";
export type SetlistMoment = Moment | typeof EXTRA_MOMENT;

export const MOMENT_SLUGS = MOMENTS.map((m) => m.slug) as Moment[];
export const SEASON_SLUGS = SEASONS.map((s) => s.slug) as Season[];

export function isMoment(value: string): value is Moment {
  return (MOMENT_SLUGS as string[]).includes(value);
}

export function isSeason(value: string): value is Season {
  return (SEASON_SLUGS as string[]).includes(value);
}

export function momentLabel(slug: string): string {
  return MOMENTS.find((m) => m.slug === slug)?.label ?? slug;
}

export function seasonLabel(slug: string): string {
  return SEASONS.find((s) => s.slug === slug)?.label ?? slug;
}

export const ANNOTATION_MARKS = [
  { mark: "up", symbol: "↑", label: "Salire con la voce" },
  { mark: "down", symbol: "↓", label: "Scendere con la voce" },
  { mark: "steady", symbol: "—", label: "Restare stabile" },
] as const;

export type AnnotationMark = (typeof ANNOTATION_MARKS)[number]["mark"];

export type Annotation = { line: number; col: number; mark: AnnotationMark };
