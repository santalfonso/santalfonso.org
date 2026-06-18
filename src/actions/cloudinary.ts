"use server";

import { v2 as cloudinary } from "cloudinary";
import { requireUser } from "@/auth";

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
};

export async function getUploadSignature(
  folder: string,
  resourceType: "image" | "raw",
): Promise<UploadSignature> {
  await requireUser();

  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = { folder, timestamp };
  if (resourceType === "image") params.format = "avif";

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
    ...(resourceType === "image" ? { format: "avif" } : {}),
  };
}
