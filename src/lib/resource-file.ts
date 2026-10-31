/** Regole per i file delle risorse scaricabili (caricati su Cloudinary dall'admin). */

/** Il file deve stare sul Cloudinary della parrocchia: niente indirizzi esterni o `data:`. */
export function isOwnCloudinaryUrl(value: string): boolean {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && url.pathname.startsWith(`/${cloud}/`);
  } catch {
    return false;
  }
}

/** Tipi mostrati nel browser; tutto il resto si scarica come allegato. */
const INLINE: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};
const ATTACHMENT: Record<string, string> = {
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  txt: "text/plain; charset=utf-8",
  zip: "application/zip",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
};

function extensionOf(name: string): string {
  const m = /\.([a-z0-9]{1,5})$/i.exec(name.trim());
  return m ? m[1].toLowerCase() : "";
}

/** Content-Type e modo di apertura decisi dall'estensione, mai dal server remoto. */
export function fileDelivery(fileName: string, fileUrl: string): { contentType: string; inline: boolean } {
  const ext = extensionOf(fileName) || extensionOf(new URL(fileUrl).pathname);
  if (INLINE[ext]) return { contentType: INLINE[ext], inline: true };
  return { contentType: ATTACHMENT[ext] ?? "application/octet-stream", inline: false };
}

/** Content-Disposition valido anche con accenti, apostrofi tipografici ed emoji nel nome. */
export function contentDisposition(fileName: string, inline: boolean): string {
  const name = fileName.replace(/[\r\n"\\]/g, "").trim() || "documento";
  const ascii = name.normalize("NFKD").replace(/[^\x20-\x7e]/g, "").replace(/\s+/g, " ").trim() || "documento";
  return `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}
