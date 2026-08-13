"use client";

import { useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { RotateCcw, RotateCw, Check, X } from "lucide-react";

async function getCroppedCanvas(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const out = document.createElement("canvas");
  out.width = pixelCrop.width;
  out.height = pixelCrop.height;
  const outCtx = out.getContext("2d")!;
  outCtx.drawImage(
    canvas,
    pixelCrop.x + (safeArea - image.width) / 2,
    pixelCrop.y + (safeArea - image.height) / 2,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    out.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob failed"));
    }, "image/webp", 0.92);
  });
}

function createImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = src;
  });
}

interface ImageCropModalProps {
  src: string;
  aspect?: number;
  onConfirm: (blob: Blob, previewUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropModal({ src, aspect = 1, onConfirm, onCancel }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, pixelCrop: Area) => {
    setCroppedArea(pixelCrop);
  }, []);

  async function handleConfirm() {
    if (!croppedArea) return;
    setProcessing(true);
    try {
      const blob = await getCroppedCanvas(src, croppedArea, rotation);
      const previewUrl = URL.createObjectURL(blob);
      onConfirm(blob, previewUrl);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Editar imagen"
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950"
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white"
        >
          <X className="h-4 w-4" /> Cancelar
        </button>
        <p className="text-sm font-semibold text-white">Ajustar imagen</p>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={processing}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-brand-400 disabled:pointer-events-none disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          {processing ? "Procesando…" : "Listo"}
        </button>
      </div>

      {/* Crop area */}
      <div className="relative flex-1">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: "#09090b" },
            cropAreaStyle: { border: "2px solid #d4a800", borderRadius: 8 },
          }}
        />
      </div>

      {/* Controls */}
      <div className="flex shrink-0 flex-col gap-4 border-t border-white/10 px-5 py-4">
        {/* Rotation buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setRotation((r) => r - 90)}
            aria-label="Girar 90° a la izquierda"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <span className="min-w-12 text-center text-sm text-zinc-400">{rotation}°</span>
          <button
            type="button"
            onClick={() => setRotation((r) => r + 90)}
            aria-label="Girar 90° a la derecha"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>

        {/* Zoom slider — wrapped in py-3 to expand touch area on iOS */}
        <div className="flex items-center gap-3">
          <span className="w-8 text-right text-xs text-zinc-500">Zoom</span>
          <div className="flex flex-1 items-center py-3">
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-brand-500"
            />
          </div>
          <span className="w-8 text-xs text-zinc-500">{zoom.toFixed(1)}×</span>
        </div>
      </div>
    </div>
  );
}
