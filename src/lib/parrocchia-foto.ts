/** Foto delle pagine della parrocchia su Cloudinary (AVIF, cartelle santalfonso/...). */
const CDN = "https://res.cloudinary.com/dksk2bjyd/image/upload";

/** Indirizzo della foto, ridotta a `width` pixel di larghezza (resta AVIF). */
export function foto(path: string, width?: number): string {
  return width ? `${CDN}/c_limit,w_${width}/santalfonso/${path}.avif` : `${CDN}/santalfonso/${path}.avif`;
}

/** Larghezze in cui viene mostrata la foto: a tutta pagina fino al contenitore di 1200 px. */
export const FOTO_SIZES = "(max-width: 1240px) 100vw, 1200px";

/**
 * Versioni più piccole della stessa foto (srcset): sul telefono il browser sceglie quella
 * adatta allo schermo invece di scaricare l'originale da 1100-2000 px.
 */
export function fotoSrcSet(url: string): string | undefined {
  const m = /\/c_limit,w_(\d+)\//.exec(url);
  if (!m) return undefined;
  const max = Number(m[1]);
  return [640, 1000, 1400]
    .filter((w) => w < max)
    .concat(max)
    .map((w) => `${url.replace(/\/c_limit,w_\d+\//, `/c_limit,w_${w}/`)} ${w}w`)
    .join(", ");
}
