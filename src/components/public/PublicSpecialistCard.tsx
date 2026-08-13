"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { PublicSpecialist } from "@/lib/public-data";
import { formatFullName } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

export function PublicSpecialistCard({ specialist }: { specialist: PublicSpecialist }) {
  const name = formatFullName(specialist);

  return (
    <Link
      href={`/talentos/${specialist.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        {specialist.photoUrl ? (
          <Image
            src={specialist.photoUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black">
            <Avatar name={name} size="xl" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="mt-0.5 truncate text-[11px] text-white/50">
              {specialist.age} años · {GENRE_LABEL[specialist.genre] ?? specialist.genre}
            </p>
          </div>
          {specialist.location && (
            <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[10px] text-white/45">
              <MapPin className="h-3 w-3" />
              {specialist.location}
            </span>
          )}
        </div>

        {specialist.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specialist.specialties.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[9.5px] font-medium tracking-wide text-brand-300 uppercase ring-1 ring-inset ring-brand-500/25"
              >
                {s}
              </span>
            ))}
            {specialist.specialties.length > 3 && (
              <span className="rounded-full px-1.5 py-0.5 text-[9.5px] text-white/35">
                +{specialist.specialties.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
