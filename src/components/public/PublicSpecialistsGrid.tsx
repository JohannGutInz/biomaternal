"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PublicSpecialistCard } from "./PublicSpecialistCard";
import type { PublicSpecialist } from "@/lib/public-data";
import { cn, formatFullName } from "@/lib/utils";

interface FilterOption {
  id: string;
  name: string;
}

interface PublicSpecialistsGridProps {
  specialists: PublicSpecialist[];
  specialties: FilterOption[];
}

const GENRE_OPTIONS: { value: "" | "MALE" | "FEMALE"; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "FEMALE", label: "Mujeres" },
  { value: "MALE", label: "Hombres" },
];

function FilterGroup({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/8 pb-4 last:border-0 last:pb-0">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[10.5px] font-semibold tracking-[0.16em] text-white uppercase">{label}</span>
        {hint && <span className="text-[9px] text-white/35">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[10.5px] font-medium tracking-wide uppercase transition-colors",
        active ? "border-white bg-white text-black" : "border-white/15 bg-white/5 text-white/65 hover:border-white/30 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export function PublicSpecialistsGrid({ specialists, specialties }: PublicSpecialistsGridProps) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<"" | "MALE" | "FEMALE">("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return specialists.filter((s) => {
      if (q && !formatFullName(s).toLowerCase().includes(q)) return false;
      if (genre && s.genre !== genre) return false;
      if (selectedSpecialties.length > 0 && !selectedSpecialties.some((sp) => s.specialties.includes(sp))) return false;
      return true;
    });
  }, [specialists, query, genre, selectedSpecialties]);

  function toggleSpecialty(value: string) {
    setSelectedSpecialties((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  }

  const isFiltered = Boolean(query) || Boolean(genre) || selectedSpecialties.length > 0;

  function clearFilters() {
    setQuery("");
    setGenre("");
    setSelectedSpecialties([]);
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr] lg:items-start">
      <aside className="rounded-3xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <div className="mb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full rounded-full border border-white/15 bg-white/5 py-2.5 pr-3 pl-9 text-xs text-white placeholder:text-white/35 outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <FilterGroup label="Género">
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((g) => (
                <Pill key={g.value} active={genre === g.value} onClick={() => setGenre(g.value)}>
                  {g.label}
                </Pill>
              ))}
            </div>
          </FilterGroup>

          {specialties.length > 0 && (
            <FilterGroup label="Especialidades" hint="multi">
              <div className="flex flex-wrap gap-2">
                {specialties.map((sp) => (
                  <Pill
                    key={sp.id}
                    active={selectedSpecialties.includes(sp.name)}
                    onClick={() => toggleSpecialty(sp.name)}
                  >
                    {sp.name}
                  </Pill>
                ))}
              </div>
            </FilterGroup>
          )}

          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 text-[10.5px] font-semibold tracking-[0.14em] text-white/80 uppercase transition-colors hover:bg-white/10"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </aside>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/10 bg-black/50 px-4 py-2.5">
          <span className="text-[10.5px] font-semibold tracking-[0.14em] text-white/65 uppercase">
            <b className="text-white">{filtered.length}</b> {filtered.length === 1 ? "perfil encontrado" : "perfiles encontrados"}
            {isFiltered && <span className="ml-1.5 text-brand-400">· filtrado</span>}
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((specialist) => (
              <PublicSpecialistCard key={specialist.id} specialist={specialist} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/50 py-20 text-center">
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-white/40 uppercase">Sin resultados</p>
            <h3 className="mt-3 text-lg font-light text-white">¿No encontraste lo que buscabas?</h3>
            <p className="mt-2 max-w-sm text-sm text-white/50">
              Prueba quitando algún filtro, o escríbenos y te ayudamos a encontrar al especialista ideal.
            </p>
            <Link
              href="/contacto"
              className="mt-6 rounded-full bg-brand-500 px-6 py-2.5 text-xs font-semibold tracking-wide text-white uppercase transition-colors hover:bg-brand-600"
            >
              Contactar
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
