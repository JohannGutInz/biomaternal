"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function BookGallery({ photoUrls, modelName }: { photoUrls: string[]; modelName: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function open(index: number) {
    setLightboxIndex(index);
  }

  function close() {
    setLightboxIndex(null);
  }

  function prev() {
    setLightboxIndex((i) => (i == null ? null : (i - 1 + photoUrls.length) % photoUrls.length));
  }

  function next() {
    setLightboxIndex((i) => (i == null ? null : (i + 1) % photoUrls.length));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") close();
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {photoUrls.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => open(i)}
            aria-label={`Ver foto de book ${i + 1} de ${modelName}`}
            className="group relative aspect-square overflow-hidden rounded-xl bg-white/5 transition-transform duration-200 hover:scale-[1.03] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Image
              src={url}
              alt={`Foto de book ${i + 1} de ${modelName}`}
              fill
              className="object-cover transition-opacity duration-200 group-hover:opacity-90"
              unoptimized
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Foto de book ${lightboxIndex + 1} de ${photoUrls.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
          ref={(el) => el?.focus()}
        >
          {/* Close */}
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            {lightboxIndex + 1} / {photoUrls.length}
          </span>

          {/* Prev */}
          {photoUrls.length > 1 && (
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div className="relative mx-auto h-[80vh] w-full max-w-3xl px-16">
            <Image
              src={photoUrls[lightboxIndex]}
              alt={`Foto de book ${lightboxIndex + 1} de ${modelName}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Next */}
          {photoUrls.length > 1 && (
            <button
              type="button"
              onClick={next}
              aria-label="Foto siguiente"
              className="absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Click backdrop to close */}
          <div className="absolute inset-0 -z-10" onClick={close} />
        </div>
      )}
    </>
  );
}
