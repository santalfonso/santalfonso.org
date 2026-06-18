import { getUploadSignature } from "@/actions/cloudinary";

export async function uploadToCloudinary(
  file: File,
  folder: string,
  resourceType: "image" | "raw" = "image",
): Promise<string> {
  const sig = await getUploadSignature(folder, resourceType);

  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.api_key);
  fd.append("signature", sig.signature);
  fd.append("timestamp", String(sig.timestamp));
  fd.append("folder", sig.folder);
  if (sig.format) fd.append("format", sig.format);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloud_name}/${resourceType}/upload`,
    { method: "POST", body: fd },
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Upload non riuscito");
  return data.secure_url as string;
}
