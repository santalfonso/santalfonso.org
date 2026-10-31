/** Foto delle pagine della parrocchia su Cloudinary (AVIF, cartelle santalfonso/...). */
const CDN = "https://res.cloudinary.com/dksk2bjyd/image/upload";

/** Indirizzo della foto, ridotta a `width` pixel di larghezza (resta AVIF). */
export function foto(path: string, width?: number): string {
  return width ? `${CDN}/c_limit,w_${width}/santalfonso/${path}.avif` : `${CDN}/santalfonso/${path}.avif`;
}
