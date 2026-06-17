import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Carica un'immagine su Cloudinary e restituisce l'URL pubblico. */
export async function uploadImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
  const originalName = file.name.replace(/\.[^/.]+$/, "");
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "santalfonso",
    resource_type: "image",
    format: "avif",
    public_id: originalName,
    overwrite: false,
    unique_filename: true,
  });
  return result.secure_url;
}

/** Carica un file raw (PDF, ecc.) su Cloudinary e restituisce l'URL pubblico. */
export async function uploadFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;
  const originalName = file.name.replace(/\.[^/.]+$/, "");
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "santalfonso/risorse",
    resource_type: "raw",
    public_id: originalName,
    overwrite: false,
    unique_filename: true,
  });
  return result.secure_url;
}
