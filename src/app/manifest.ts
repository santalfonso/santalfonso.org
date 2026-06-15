import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Parrocchia Sant'Alfonso",
    short_name: "Sant'Alfonso",
    description:
      "Parrocchia Sant'Alfonso Maria de' Liguori — Prima Porta, Roma",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1F7AE0",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
