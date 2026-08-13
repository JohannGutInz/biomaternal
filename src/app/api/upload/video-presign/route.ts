import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { getPresignedVideoUploadPost, getSignedDownloadUrl } from "@/lib/storage";
import { prisma } from "@/db";

const ALLOWED_TYPES = new Set(["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]);
const MAX_BYTES = 500 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);
  const session = token ? await verifySessionToken(token.value) : null;

  let body: { filename?: string; contentType?: string; sizeBytes?: number; modelId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { filename, contentType, sizeBytes } = body;

  if (!contentType || !ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }

  if (typeof sizeBytes === "number" && sizeBytes > MAX_BYTES) {
    return NextResponse.json({ error: "Video excede 500 MB" }, { status: 400 });
  }

  let modelId: string | null = null;
  if (session?.role === "SPECIALIST") {
    const model = await prisma.model.findUnique({ where: { userId: session.sub }, select: { id: true } });
    if (!model) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    modelId = model.id;
  } else if (session && typeof body.modelId === "string" && body.modelId) {
    modelId = body.modelId;
  }
  // Sin sesión: registro público, el video queda en media/videos/ hasta que exista el modelo.

  const ext = filename?.split(".").pop() ?? "mp4";
  const key = modelId
    ? `modelos/${modelId}/videos/${randomUUID()}.${ext}`
    : `media/videos/${randomUUID()}.${ext}`;

  try {
    const [post, objectUrl] = await Promise.all([
      getPresignedVideoUploadPost(key, contentType, MAX_BYTES),
      getSignedDownloadUrl(key),
    ]);
    return NextResponse.json({ ...post, objectUrl });
  } catch (err) {
    console.error("[upload/video-presign]", err);
    return NextResponse.json({ error: "Error al generar URL de carga" }, { status: 500 });
  }
}
