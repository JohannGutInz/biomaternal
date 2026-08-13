"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

interface MultiSelectPickerProps {
  label: string;
  hint?: string;
  options: Option[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
  placeholder?: string;
}

export function MultiSelectPicker({
  label,
  hint,
  options,
  selectedIds,
  onChange,
  error,
  placeholder = "Buscar y seleccionar…",
}: MultiSelectPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const picked = options.filter((o) => selectedIds.includes(o.id));
  const filtered = useMemo(
    () => options.filter((o) => o.name.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label} {hint && <span className="text-zinc-400 font-normal">{hint}</span>}
      </label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm text-left outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
          error && "border-rose-300",
        )}
      >
        <span className={picked.length > 0 ? "text-zinc-900" : "text-zinc-400"}>
          {picked.length > 0 ? `${picked.length} seleccionada${picked.length === 1 ? "" : "s"}` : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-zinc-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg">
          <div className="relative border-b border-zinc-100 p-2">
            <Search className="pointer-events-none absolute top-1/2 left-4 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="w-full rounded-md border-none bg-zinc-50 py-1.5 pr-2 pl-8 text-sm outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-zinc-400">Sin resultados.</p>
            )}
            {filtered.map((o) => (
              <label
                key={o.id}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(o.id)}
                  onChange={() => toggle(o.id)}
                  className="rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                />
                {o.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {picked.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {picked.map((item) => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
            >
              {item.name}
              <button
                type="button"
                onClick={() => onChange(selectedIds.filter((id) => id !== item.id))}
                className="ml-0.5 text-zinc-400 hover:text-zinc-700"
                aria-label={`Quitar ${item.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
