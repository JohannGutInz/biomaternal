import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { uploadImage } from "@/lib/storage";
import { prisma } from "@/db";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE);
  const session = token ? await verifySessionToken(token.value) : null;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Cuerpo de solicitud inválido" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Campo 'file' requerido" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Tipo de archivo no permitido" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Archivo excede 10 MB" }, { status: 400 });
  }

  let modelId: string | null = null;
  if (session?.role === "SPECIALIST") {
    const model = await prisma.model.findUnique({ where: { userId: session.sub }, select: { id: true } });
    if (!model) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    modelId = model.id;
  } else if (session) {
    const requestedModelId = formData.get("modelId");
    if (typeof requestedModelId === "string" && requestedModelId) modelId = requestedModelId;
  }
  // Sin sesión: registro público, la foto queda en media/images/ hasta que exista el modelo.

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = modelId
    ? `modelos/${modelId}/photos/${randomUUID()}.webp`
    : `media/images/${randomUUID()}.webp`;

  try {
    const url = await uploadImage(buffer, key);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload/image]", err);
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
