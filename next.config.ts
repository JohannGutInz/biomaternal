import type { NextConfig } from "next";

// EventoFoto marketing photos (public bucket prefix `eventos/*`) are served as
// bare public URLs (see uploadPublicImage/getPublicUrl in src/lib/storage.ts),
// unlike model assets which stay behind signed URLs and never hit next/image's
// optimizer as a remote host. Derived from env instead of hardcoded so this
// keeps working if the storage host ever changes (e.g. a CDN in front of S3).
const STORAGE_BUCKET = process.env.STORAGE_BUCKET;
const STORAGE_PUBLIC_BASE = process.env.STORAGE_PUBLIC_URL ?? process.env.STORAGE_ENDPOINT;

function eventoFotosRemotePattern(): URL | null {
  if (!STORAGE_PUBLIC_BASE || !STORAGE_BUCKET) return null;
  try {
    return new URL(`${STORAGE_PUBLIC_BASE.replace(/\/$/, "")}/${STORAGE_BUCKET}/eventos/**`);
  } catch {
    return null;
  }
}

const remotePattern = eventoFotosRemotePattern();

const nextConfig: NextConfig = {
  devIndicators: false,
  // TEMPORAL: manda la raíz directo al login para que el equipo de pruebas
  // entre al backoffice sin pasar por la landing pública. Quitar este bloque
  // (o borrar el archivo) para que "/" vuelva a servir la landing.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/app/login",
        permanent: false,
      },
    ];
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.app.github.dev"],
    },
    authInterrupts: true,
  },
  images: {
    remotePatterns: remotePattern ? [remotePattern] : [],
    // Default allow-list is just [75] — BrandBackground needs a higher quality
    // to avoid visible compression artifacts on the full-viewport hero image.
    qualities: [75, 92],
  },
};

export default nextConfig;
