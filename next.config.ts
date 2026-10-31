import type { NextConfig } from "next";

/**
 * Header di sicurezza per tutte le pagine. Versione prudente: non limita script, immagini
 * né iframe (mappa di Google, video YouTube), solo chi può incorniciare il sito e cosa
 * il browser può fare di propria iniziativa.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // non "no-referrer": i video YouTube incorporati non partono senza referrer
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // fullscreen, appunti e condivisione restano consentiti (video, "Copia link", "Condividi")
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // i file vanno direttamente dal browser a Cloudinary: alle azioni arrivano solo testi
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // escluso il download dei file: object-src 'none' può bloccare il visualizzatore PDF
        source: "/:path((?!risorse/\\d+/file$).*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
