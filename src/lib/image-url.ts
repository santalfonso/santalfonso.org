/**
 * Foto salvate su Cloudinary (copertine, locandine, gallerie): chiede a Cloudinary una copia
 * larga al massimo `width` pixel invece dell'originale da 1400-2000 px. Il formato resta
 * quello del file (AVIF); gli indirizzi non Cloudinary, o già trasformati, restano invariati.
 */
export function sizedImage(url: string | null | undefined, width: number): string {
  if (!url) return "";
  const m = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/.exec(url);
  if (!m) return url;
  const rest = m[2];
  // già con una trasformazione (es. c_limit,w_800/ o f_auto/): non se ne aggiunge un'altra
  if (/^[a-z]{1,3}_[^/]*\//.test(rest)) return url;
  return `${m[1]}c_limit,w_${width}/${rest}`;
}
