import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import sharp from "sharp";

function getS3Client() {
  return new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY!,
      secretAccessKey: process.env.STORAGE_SECRET_KEY!,
    },
    forcePathStyle: true,
  });
}

function getBucket() {
  const bucket = process.env.STORAGE_BUCKET;
  if (!bucket) throw new Error("STORAGE_BUCKET is not configured");
  return bucket;
}

function getPublicBaseUrl() {
  const url = process.env.STORAGE_PUBLIC_URL;
  if (!url) throw new Error("STORAGE_PUBLIC_URL is not configured");
  return url.replace(/\/$/, "");
}

// Path-style URL, same shape as the signed GET URLs this module issues
// (forcePathStyle: true) but without a query-string signature — only
// resolves to something browsable once the bucket policy for this key's
// prefix allows public s3:GetObject. keyFromObjectUrl() below also works
// against URLs built here, since it only inspects the pathname.
export function getPublicUrl(key: string): string {
  return `${getPublicBaseUrl()}/${getBucket()}/${key}`;
}

async function processAndPutImage(
  buffer: Buffer,
  key: string,
  options?: { quality?: number; maxWidth?: number },
): Promise<void> {
  const { quality = 80, maxWidth = 1920 } = options ?? {};

  const processed = await sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  const s3 = getS3Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: processed,
      ContentType: "image/webp",
    }),
  );
}

export async function uploadImage(
  buffer: Buffer,
  key: string,
  options?: { quality?: number; maxWidth?: number },
): Promise<string> {
  await processAndPutImage(buffer, key, options);
  return getSignedDownloadUrl(key);
}

// Same resize→webp pipeline as uploadImage, but for public marketing assets
// (agency-owned, not model-owned) — returns a bare public URL instead of a
// signed one. Used by eventos/* today.
export async function uploadPublicImage(
  buffer: Buffer,
  key: string,
  options?: { quality?: number; maxWidth?: number },
): Promise<string> {
  await processAndPutImage(buffer, key, options);
  return getPublicUrl(key);
}

export async function getPresignedVideoUploadPost(
  key: string,
  contentType: string,
  maxBytes: number,
): Promise<{ url: string; fields: Record<string, string> }> {
  const s3 = getS3Client();

  return createPresignedPost(s3, {
    Bucket: getBucket(),
    Key: key,
    Conditions: [
      ["content-length-range", 0, maxBytes],
      ["eq", "$Content-Type", contentType],
    ],
    Fields: {
      "Content-Type": contentType,
    },
    Expires: 3600,
  });
}

export async function deleteObject(key: string): Promise<void> {
  const s3 = getS3Client();
  await s3.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}

// Signed GET URLs carry the key as their path, a bare query string as signature —
// so this also recovers the key from a URL this module signed earlier.
export function keyFromObjectUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    const prefix = `/${getBucket()}/`;
    return pathname.startsWith(prefix) ? decodeURIComponent(pathname.slice(prefix.length)) : null;
  } catch {
    return null;
  }
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const s3 = getS3Client();
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn },
  );
}

// Specialist.photoUrl / Consultorio photo urls are stored as bare S3 keys
// (private bucket) — resolve to a signed GET url for display. External
// links (e.g. an http(s) URL entered by mistake) pass through unchanged.
export async function signPhotoUrl(key: string | null | undefined): Promise<string | null> {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  return getSignedDownloadUrl(key);
}

export async function signAssetUrls<T extends { url: string }>(assets: T[]): Promise<T[]> {
  return Promise.all(
    assets.map(async (asset) => {
      // Recover any external URL that was incorrectly wrapped in an S3 signed URL
      // (e.g. a YouTube link that got passed through getSignedDownloadUrl by mistake)
      const recoveredKey = keyFromObjectUrl(asset.url);
      if (recoveredKey && (recoveredKey.startsWith("http://") || recoveredKey.startsWith("https://"))) {
        return { ...asset, url: recoveredKey };
      }

      // External URLs are not S3 keys — return as-is
      if (asset.url.startsWith("http://") || asset.url.startsWith("https://")) {
        return asset;
      }

      return { ...asset, url: await getSignedDownloadUrl(asset.url) };
    }),
  );
}
