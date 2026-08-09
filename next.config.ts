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
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "*.app.github.dev"],
    },
    authInterrupts: true,
  },
  images: {
    remotePatterns: remotePattern ? [remotePattern] : [],
  },
};

export default nextConfig;
