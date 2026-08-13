"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { crearClienteAction } from "@/lib/actions";

export interface ClientOption {
  id: string;
  name: string;
  phone: string | null;
}

// Selector de cliente con búsqueda y creación al vuelo — escribir un nombre
// que no existe todavía ofrece "Crear cliente" sin salir del formulario
// donde se está capturando la cita/venta/llamada.
export function ClientPicker({
  label,
  clients,
  value,
  onChange,
  onClientCreated,
  error,
}: {
  label: string;
  clients: ClientOption[];
  value: string | undefined;
  onChange: (clientId: string | undefined) => void;
  onClientCreated?: (client: ClientOption) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = clients.find((c) => c.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.phone?.includes(q));
  }, [clients, query]);

  const exactMatch = clients.some((c) => c.name.trim().toLowerCase() === query.trim().toLowerCase());

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function select(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  async function handleCreate() {
    const name = query.trim();
    if (!name) return;
    setCreating(true);
    const result = await crearClienteAction({ name });
    setCreating(false);
    if (result.status === "success" && result.clientId) {
      onClientCreated?.({ id: result.clientId, name, phone: null });
      select(result.clientId);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</label>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm text-left outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
          error && "border-rose-300",
        )}
      >
        <span className={selected ? "text-zinc-900" : "text-zinc-400"}>
          {selected ? `${selected.name}${selected.phone ? ` · ${selected.phone}` : ""}` : "Buscar o crear cliente…"}
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
              placeholder="Nombre o teléfono…"
              className="w-full rounded-md border-none bg-zinc-50 py-1.5 pr-2 pl-8 text-sm outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => select(c.id)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
              >
                <span>{c.name}</span>
                {c.phone && <span className="text-xs text-zinc-400">{c.phone}</span>}
              </button>
            ))}
            {filtered.length === 0 && !query.trim() && (
              <p className="px-3 py-2 text-sm text-zinc-400">Sin clientes registrados.</p>
            )}
            {query.trim() && !exactMatch && (
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                className="flex w-full items-center gap-2 border-t border-zinc-100 px-3 py-2 text-left text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-60"
              >
                <Plus className="h-3.5 w-3.5" />
                {creating ? "Creando…" : `Crear cliente "${query.trim()}"`}
              </button>
            )}
          </div>
        </div>
      )}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
