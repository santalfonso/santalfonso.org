"use server";

import { v2 as cloudinary } from "cloudinary";
import { isSuperAdmin, requireStaff } from "@/auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadSignature = {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  format?: string;
  transformation?: string;
};

/**
 * Immagini salvate già in AVIF e larghe al massimo 1600 px, la misura più grande che il sito
 * chiede a Cloudinary (vedi sizedImage): i file più grandi occuperebbero spazio senza servire.
 * c_limit riduce soltanto, non ingrandisce mai le immagini più piccole.
 */
const IMAGE_UPLOAD = { format: "avif", transformation: "c_limit,w_1600" } as const;

/** Cartelle in cui lo staff carica dal pannello: immagini nella principale, documenti in "risorse". */
const ALLOWED_FOLDERS: Record<"image" | "raw", readonly string[]> = {
  image: ["santalfonso"],
  raw: ["santalfonso/risorse"],
};

export async function getUploadSignature(
  folder: string,
  resourceType: "image" | "raw",
): Promise<UploadSignature> {
  const user = await requireStaff();
  if (resourceType !== "image" && resourceType !== "raw") throw new Error("Tipo di file non valido");
  // i documenti vanno solo nelle Risorse, gestite da superadmin e owner
  if (resourceType === "raw" && !isSuperAdmin(user.role)) throw new Error("Non autorizzato");
  if (!ALLOWED_FOLDERS[resourceType].includes(folder)) throw new Error("Cartella non valida");

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = { folder, timestamp };
  if (resourceType === "image") Object.assign(params, IMAGE_UPLOAD);

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY!,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
    ...(resourceType === "image" ? IMAGE_UPLOAD : {}),
  };
}
