"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Search } from "lucide-react";
import type { SpecialistWithRelations } from "@/lib/data";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { APP_ROUTE } from "@/lib/routes";
import { formatDate, formatFullName } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

export function SpecialistsGrid({ specialists }: { specialists: SpecialistWithRelations[] }) {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("todos");
  const [specialtyId, setSpecialtyId] = useState("todas");
  const [visibility, setVisibility] = useState("todos");

  const allSpecialties = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of specialists) {
      for (const sp of s.specialties) map.set(sp.id, sp.name);
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [specialists]);

  const filtered = useMemo(() => {
    return specialists.filter((s) => {
      const matchQuery =
        query.trim() === "" ||
        formatFullName(s).toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase());
      const matchGender = gender === "todos" || s.genre === gender;
      const matchSpecialty =
        specialtyId === "todas" || s.specialties.some((sp) => sp.id === specialtyId);
      const matchVisibility =
        visibility === "todos" ||
        (visibility === "publicos" && s.isPublic) ||
        (visibility === "ocultos" && !s.isPublic);
      return matchQuery && matchGender && matchSpecialty && matchVisibility;
    });
  }, [specialists, query, gender, specialtyId, visibility]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="w-full sm:max-w-xs sm:flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            icon={<Search />}
          />
        </div>
        <Select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full text-zinc-600 sm:w-auto">
          <option value="todos">Todos los géneros</option>
          <option value="MALE">Masculino</option>
          <option value="FEMALE">Femenino</option>
        </Select>
        <Select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} className="w-full text-zinc-600 sm:w-auto">
          <option value="todas">Todas las especialidades</option>
          {allSpecialties.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
        <Select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full text-zinc-600 sm:w-auto">
          <option value="todos">Públicos y ocultos</option>
          <option value="publicos">Solo públicos</option>
          <option value="ocultos">Solo ocultos</option>
        </Select>
        <span className="text-xs text-zinc-400 sm:ml-auto">
          {filtered.length} de {specialists.length} especialistas
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((specialist) => (
          <Link
            key={specialist.id}
            href={`${APP_ROUTE.app.specialists.index}/${specialist.id}`}
            className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
          >
            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
              {specialist.photoUrl ? (
                <Image
                  src={specialist.photoUrl}
                  alt={formatFullName(specialist)}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <Avatar name={formatFullName(specialist)} size="xl" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="truncate text-sm font-semibold text-zinc-900">{formatFullName(specialist)}</p>
                  <p className="text-xs text-zinc-400">{formatDate(specialist.birthDate)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                  {GENRE_LABEL[specialist.genre] ?? specialist.genre}
                </span>
              </div>
              <span
                className={`mt-2 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  specialist.isPublic ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {specialist.isPublic ? "Visible" : "Oculto"}
              </span>
              {specialist.location && (
                <div className="mt-3 flex items-center gap-1 text-xs text-zinc-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{specialist.location}</span>
                </div>
              )}
              {specialist.specialties.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1 border-t border-zinc-100 pt-3">
                  {specialist.specialties.map((sp) => (
                    <span key={sp.id} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                      {sp.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-400">
          Ningún especialista coincide con los filtros aplicados.
        </div>
      )}
    </div>
  );
}
