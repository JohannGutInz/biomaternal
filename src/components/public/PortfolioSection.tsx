"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PortfolioEntryPublico } from "@/lib/public-data";

function CoverPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900">
      <span className="text-xs text-zinc-600">sin foto</span>
    </div>
  );
}

interface LightboxProps {
  entry: PortfolioEntryPublico;
  onClose: () => void;
}

function Lightbox({ entry, onClose }: LightboxProps) {
  const fotosConUrl = entry.fotos.filter((f) => f.url);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-zinc-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{entry.marca}</h2>
            <p className="mt-0.5 text-sm text-zinc-400">
              {entry.fecha} · {entry.lugar}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => {
            const foto = fotosConUrl[i];
            return (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-xl bg-zinc-800"
              >
                {foto ? (
                  <img
                    src={foto.url}
                    alt={`${entry.marca} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface Props {
  entries: PortfolioEntryPublico[];
}

export function PortfolioSection({ entries }: Props) {
  const [selected, setSelected] = useState<PortfolioEntryPublico | null>(null);
  const close = useCallback(() => setSelected(null), []);

  if (entries.length === 0) return null;

  return (
    <>
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-10">
          <p className="mb-2 text-[11px] font-semibold tracking-[0.3em] text-zinc-500 uppercase">
            Portafolio
          </p>
          <h2 className="text-3xl font-light tracking-tight text-zinc-900">
            Eventos cubiertos
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => {
            const portada = entry.fotos.find((f) => f.isPortada) ?? entry.fotos[0];
            return (
              <button
                key={entry.id}
                onClick={() => setSelected(entry)}
                className="group text-left overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md"
              >
                {/* Cover image */}
                <div className="aspect-[4/3] overflow-hidden">
                  {portada?.url ? (
                    <img
                      src={portada.url}
                      alt={entry.marca}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <CoverPlaceholder />
                  )}
                </div>

                {/* Info */}
                <div className="bg-zinc-950 p-5">
                  <p className="text-base font-bold text-white">{entry.marca}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {entry.fecha} · {entry.lugar}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected && <Lightbox entry={selected} onClose={close} />}
    </>
  );
}
