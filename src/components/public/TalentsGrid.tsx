"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { TalentCard } from "./TalentCard";
import type { PublicModel, PublicGeografia } from "@/lib/public-data";
import { cn, formatFullName } from "@/lib/utils";

interface FilterOption {
  id: string;
  name: string;
}

interface TalentsGridProps {
  models: PublicModel[];
  categories: FilterOption[];
  activities: FilterOption[];
  geografia: PublicGeografia;
}

const GENRE_OPTIONS: { value: "" | "MALE" | "FEMALE"; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "FEMALE", label: "Mujeres" },
  { value: "MALE", label: "Hombres" },
];

const SORT_OPTIONS = [
  { value: "recientes", label: "Más recientes" },
  { value: "estatura_desc", label: "Mayor estatura" },
  { value: "edad_asc", label: "Menor edad" },
  { value: "nombre", label: "Nombre A-Z" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

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

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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

function RangeField({
  label,
  unit,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[9.5px] text-white/45">
        <span>{label}</span>
        <span className="text-white">
          {value[0]}
          {unit} – {value[1]}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={value[1]}
          value={value[0]}
          onChange={(e) => onChange([Math.min(Number(e.target.value), value[1]), value[1]])}
          aria-label={`${label} mínimo`}
          className="w-full min-w-0 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-center text-xs text-white outline-none focus:border-glam-500"
        />
        <span className="text-white/30">–</span>
        <input
          type="number"
          min={value[0]}
          max={max}
          value={value[1]}
          onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0])])}
          aria-label={`${label} máximo`}
          className="w-full min-w-0 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-center text-xs text-white outline-none focus:border-glam-500"
        />
      </div>
    </div>
  );
}

export function TalentsGrid({ models, categories, activities, geografia }: TalentsGridProps) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [genre, setGenre] = useState<"" | "MALE" | "FEMALE">("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [stateId, setStateId] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("recientes");

  const ageBounds = useMemo(() => {
    const ages = models.map((m) => m.age);
    return { min: ages.length ? Math.min(...ages) : 18, max: ages.length ? Math.max(...ages) : 60 };
  }, [models]);
  const heightBounds = useMemo(() => {
    const heights = models.map((m) => m.height).filter((h): h is number => h != null);
    return { min: heights.length ? Math.min(...heights) : 150, max: heights.length ? Math.max(...heights) : 200 };
  }, [models]);

  const [ageRange, setAgeRange] = useState<[number, number] | null>(null);
  const [heightRange, setHeightRange] = useState<[number, number] | null>(null);
  const effectiveAgeRange = useMemo(
    () => ageRange ?? [ageBounds.min, ageBounds.max] as [number, number],
    [ageRange, ageBounds],
  );
  const effectiveHeightRange = useMemo(
    () => heightRange ?? [heightBounds.min, heightBounds.max] as [number, number],
    [heightRange, heightBounds],
  );

  const statesForCountry = useMemo(() => {
    const c = geografia.countries.find((c) => c.name === country);
    return c ? geografia.states.filter((s) => s.countryId === c.id) : [];
  }, [geografia, country]);
  const municipalitiesForState = useMemo(
    () => geografia.municipalities.filter((m) => m.stateId === stateId),
    [geografia, stateId],
  );
  const stateMunicipalityNames = useMemo(
    () => new Set(municipalitiesForState.map((m) => m.name)),
    [municipalitiesForState],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const [ageMin, ageMax] = effectiveAgeRange;
    const [heightMin, heightMax] = effectiveHeightRange;
    const ageNarrowed = ageMin > ageBounds.min || ageMax < ageBounds.max;
    const heightNarrowed = heightMin > heightBounds.min || heightMax < heightBounds.max;

    return models.filter((m) => {
      if (q && !formatFullName(m).toLowerCase().includes(q)) return false;
      if (country && m.countryName !== country) return false;
      if (genre && m.genre !== genre) return false;
      if (selectedCategories.length > 0 && !selectedCategories.some((c) => m.categories.includes(c))) return false;
      if (selectedActivities.length > 0 && !selectedActivities.some((a) => m.activities.includes(a))) return false;
      if (ageNarrowed && (m.age < ageMin || m.age > ageMax)) return false;
      if (heightNarrowed && (m.height == null || m.height < heightMin || m.height > heightMax)) return false;
      if (municipality) {
        if (m.cityName !== municipality) return false;
      } else if (stateId && !stateMunicipalityNames.has(m.cityName)) {
        return false;
      }
      return true;
    });
  }, [
    models,
    query,
    country,
    genre,
    selectedCategories,
    selectedActivities,
    effectiveAgeRange,
    effectiveHeightRange,
    ageBounds,
    heightBounds,
    municipality,
    stateId,
    stateMunicipalityNames,
  ]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "estatura_desc") list.sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
    else if (sortBy === "edad_asc") list.sort((a, b) => a.age - b.age);
    else if (sortBy === "nombre") list.sort((a, b) => formatFullName(a).localeCompare(formatFullName(b)));
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [filtered, sortBy]);

  function toggle(value: string, arr: string[], setArr: (v: string[]) => void) {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  const isFiltered =
    Boolean(query) ||
    Boolean(country) ||
    Boolean(genre) ||
    selectedCategories.length > 0 ||
    selectedActivities.length > 0 ||
    Boolean(stateId) ||
    Boolean(municipality) ||
    Boolean(ageRange) ||
    Boolean(heightRange);

  function clearFilters() {
    setQuery("");
    setCountry("");
    setGenre("");
    setSelectedCategories([]);
    setSelectedActivities([]);
    setStateId("");
    setMunicipality("");
    setAgeRange(null);
    setHeightRange(null);
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr] lg:items-start">
      {/* Filters panel */}
      <aside className="rounded-3xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <div className="mb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre…"
              className="w-full rounded-full border border-white/15 bg-white/5 py-2.5 pr-3 pl-9 text-xs text-white placeholder:text-white/35 outline-none focus:border-glam-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <FilterGroup label="A) País" hint="requerido">
            <div className="flex flex-wrap gap-2">
              <Pill active={country === ""} onClick={() => { setCountry(""); setStateId(""); setMunicipality(""); }}>
                Todos
              </Pill>
              {geografia.countries.map((c) => (
                <Pill
                  key={c.id}
                  active={country === c.name}
                  onClick={() => { setCountry(c.name); setStateId(""); setMunicipality(""); }}
                >
                  {c.name}
                </Pill>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="B) Sexo">
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((g) => (
                <Pill key={g.value} active={genre === g.value} onClick={() => setGenre(g.value)}>
                  {g.label}
                </Pill>
              ))}
            </div>
          </FilterGroup>

          {categories.length > 0 && (
            <FilterGroup label="C) Habilidades / Perfil" hint="multi">
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Pill
                    key={c.id}
                    active={selectedCategories.includes(c.name)}
                    onClick={() => toggle(c.name, selectedCategories, setSelectedCategories)}
                  >
                    {c.name}
                  </Pill>
                ))}
              </div>
            </FilterGroup>
          )}

          {activities.length > 0 && (
            <FilterGroup label="D) Extras / Requisitos" hint="multi">
              <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">
                {activities.map((a) => (
                  <Pill
                    key={a.id}
                    active={selectedActivities.includes(a.name)}
                    onClick={() => toggle(a.name, selectedActivities, setSelectedActivities)}
                  >
                    {a.name}
                  </Pill>
                ))}
              </div>
            </FilterGroup>
          )}

          <FilterGroup label="F) Datos físicos">
            <div className="flex flex-col gap-4">
              <RangeField
                label="Edad"
                unit=" a"
                min={ageBounds.min}
                max={ageBounds.max}
                value={effectiveAgeRange}
                onChange={setAgeRange}
              />
              <RangeField
                label="Estatura"
                unit=" cm"
                min={heightBounds.min}
                max={heightBounds.max}
                value={effectiveHeightRange}
                onChange={setHeightRange}
              />
            </div>
          </FilterGroup>

          {country && statesForCountry.length > 0 && (
            <FilterGroup label="G) Ubicación">
              <div className="flex flex-col gap-2">
                <select
                  value={stateId}
                  onChange={(e) => { setStateId(e.target.value); setMunicipality(""); }}
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-xs text-white outline-none focus:border-glam-500 [&>option]:bg-zinc-900"
                >
                  <option value="">Todos los estados</option>
                  {statesForCountry.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {stateId && (
                  <select
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-2.5 py-2 text-xs text-white outline-none focus:border-glam-500 [&>option]:bg-zinc-900"
                  >
                    <option value="">Todos los municipios</option>
                    {municipalitiesForState.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                )}
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

      {/* Results */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/10 bg-black/50 px-4 py-2.5">
          <span className="text-[10.5px] font-semibold tracking-[0.14em] text-white/65 uppercase">
            <b className="text-white">{sorted.length}</b> {sorted.length === 1 ? "perfil encontrado" : "perfiles encontrados"}
            {isFiltered && <span className="ml-1.5 text-glam-400">· filtrado</span>}
          </span>
          <label className="flex items-center gap-2 text-[9.5px] text-white/40">
            Orden:
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortValue)}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-white outline-none focus:border-glam-500 [&>option]:bg-zinc-900"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((model) => (
              <TalentCard key={model.id} model={model} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-black/50 py-20 text-center">
            <p className="text-[10.5px] font-semibold tracking-[0.2em] text-white/40 uppercase">Sin resultados</p>
            <h3 className="mt-3 text-lg font-light text-white">¿No encontraste lo que buscabas?</h3>
            <p className="mt-2 max-w-sm text-sm text-white/50">
              Prueba quitando algún filtro, o escríbenos y te ayudamos a encontrar el perfil ideal.
            </p>
            <Link
              href="/contacto"
              className="mt-6 rounded-full bg-glam-500 px-6 py-2.5 text-xs font-semibold tracking-wide text-white uppercase transition-colors hover:bg-glam-600"
            >
              Contactar a la agencia
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
