"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { PublicModel } from "@/lib/public-data";
import { formatFullName } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

const COUNTRY_FLAG: Record<string, string> = {
  "México": "🇲🇽",
  "Colombia": "🇨🇴",
};

export function TalentCard({ model }: { model: PublicModel }) {
  const name = formatFullName(model);

  const tabs = [
    model.casualPhotoUrls[0] && { key: "casual", label: "Casual", url: model.casualPhotoUrls[0] },
    (model.mainPhotoUrl ?? model.photoUrls[0]) && {
      key: "book",
      label: "Book",
      url: model.mainPhotoUrl ?? model.photoUrls[0],
    },
    model.eventPhotoUrls[0] && { key: "evento", label: "Evento", url: model.eventPhotoUrls[0] },
  ].filter((tab): tab is { key: string; label: string; url: string } => Boolean(tab));

  const [activeTab, setActiveTab] = useState(tabs[0]?.key);
  const activeUrl = tabs.find((t) => t.key === activeTab)?.url;

  const tags = [...model.categories.slice(0, 2), ...model.activities.slice(0, 1)];
  const extraTagsCount = model.categories.length + model.activities.length - tags.length;

  return (
    <Link
      href={`/talentos/${model.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-lg shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/40"
    >
      {/* Image area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        {activeUrl ? (
          <Image
            src={activeUrl}
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

        {/* Bottom gradient for legibility under tabs/badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/70 to-transparent" />

        {/* Photo tabs */}
        {tabs.length > 1 && (
          <div className="absolute top-2.5 left-2.5 z-10 flex gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveTab(tab.key);
                }}
                className={`rounded-full px-2 py-1 text-[9px] font-semibold tracking-[0.1em] uppercase backdrop-blur-sm transition-colors ${
                  activeTab === tab.key
                    ? "bg-white text-black"
                    : "bg-black/50 text-white/75 ring-1 ring-inset ring-white/20 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Featured badge */}
        {model.featured && (
          <span className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1 rounded-full bg-brand-500/95 px-2.5 py-1 text-[10px] font-semibold text-white shadow">
            <Star className="h-3 w-3 fill-current" /> Destacado
          </span>
        )}
      </div>

      {/* Info panel */}
      <div className="flex flex-1 flex-col gap-2 px-3.5 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="mt-0.5 truncate text-[11px] text-white/50">
              {model.height ? `${model.height} cm · ` : ""}
              {model.age} años · {GENRE_LABEL[model.genre] ?? model.genre}
            </p>
          </div>
          <span className="mt-0.5 flex shrink-0 items-center gap-1 text-[10px] text-white/45">
            <span aria-hidden>{COUNTRY_FLAG[model.countryName] ?? <MapPin className="h-3 w-3" />}</span>
            {model.cityName}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {model.categories.slice(0, 2).map((c) => (
              <span
                key={c}
                className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[9.5px] font-medium tracking-wide text-brand-300 uppercase ring-1 ring-inset ring-brand-500/25"
              >
                {c}
              </span>
            ))}
            {model.activities.slice(0, 1).map((a) => (
              <span
                key={a}
                className="rounded-full bg-white/8 px-2 py-0.5 text-[9.5px] font-medium tracking-wide text-white/65 uppercase ring-1 ring-inset ring-white/10"
              >
                {a}
              </span>
            ))}
            {extraTagsCount > 0 && (
              <span className="rounded-full px-1.5 py-0.5 text-[9.5px] text-white/35">+{extraTagsCount}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
