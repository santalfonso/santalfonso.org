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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message: string = data.error?.message ?? "";
    // es. "File size too large. Got 10612345. Maximum is 10485760."
    const max = /Maximum is (\d+)/i.exec(message);
    if (/too large/i.test(message)) {
      const mb = max ? Math.floor(Number(max[1]) / 1048576) : 10;
      throw new Error(`il file è troppo grande (massimo ${mb} MB). Riducilo, ad esempio comprimendo il PDF, e riprova.`);
    }
    throw new Error(message || "caricamento non riuscito");
  }
  return data.secure_url as string;
}
