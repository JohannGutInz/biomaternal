"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";
import { ImageCropModal } from "./ImageCropModal";

interface SpecialistPhotoUploadProps {
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  label?: string;
}

export interface SpecialistPhotoUploadHandle {
  resolvePending(url: string | undefined): Promise<string | undefined>;
}

export const SpecialistPhotoUpload = forwardRef<SpecialistPhotoUploadHandle, SpecialistPhotoUploadProps>(
  function SpecialistPhotoUpload({ value, onChange, label = "Foto de perfil" }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const rawFileName = useRef("photo.webp");
    const pendingFile = useRef<{ url: string; file: File } | null>(null);
    const [cropSrc, setCropSrc] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      async resolvePending(url) {
        if (!url || pendingFile.current?.url !== url) return url;

        const formData = new FormData();
        formData.append("file", pendingFile.current.file);

        const res = await fetch("/api/upload/image", { method: "POST", body: formData });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error ?? "Error al subir la imagen.");

        URL.revokeObjectURL(url);
        pendingFile.current = null;
        return result.url as string;
      },
    }));

    function handleFiles(files: FileList | null) {
      const file = files?.[0];
      if (!file) return;
      rawFileName.current = file.name;
      setCropSrc(URL.createObjectURL(file));
      if (inputRef.current) inputRef.current.value = "";
    }

    function handleCropConfirm(blob: Blob, previewUrl: string) {
      pendingFile.current = { url: previewUrl, file: new File([blob], rawFileName.current, { type: "image/webp" }) };
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      onChange(previewUrl);
      setCropSrc(null);
    }

    function handleCropCancel() {
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }

    function handleRemove() {
      onChange(undefined);
    }

    return (
      <>
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-500">{label}</p>
          <div
            onClick={() => inputRef.current?.click()}
            className="relative flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-zinc-200 bg-zinc-50 text-center transition hover:border-zinc-400 hover:bg-zinc-100"
          >
            {value ? (
              <Image src={value} alt="Foto de perfil" fill className="object-cover" unoptimized />
            ) : (
              <span className="px-3 text-xs text-zinc-500">Arrastra o haz clic para subir</span>
            )}
          </div>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="mt-1.5 text-xs text-zinc-400 underline hover:text-red-500"
            >
              Eliminar foto
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {cropSrc && (
          <ImageCropModal src={cropSrc} aspect={1} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
        )}
      </>
    );
  },
);
