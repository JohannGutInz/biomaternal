"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionCardProps {
  title: string;
  tag?: string;
  highlightTag?: boolean;
  variant?: "dark" | "light";
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function AccordionCard({
  title,
  tag,
  highlightTag = false,
  variant = "dark",
  defaultOpen = false,
  children,
}: AccordionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isLight = variant === "light";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border backdrop-blur-xl transition-colors duration-300",
        isLight ? "border-white/90 bg-white" : "border-white/12 bg-black/75",
        open && !isLight && "border-white/20",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
      >
        <span
          className={cn(
            "text-sm font-bold tracking-[0.1em] uppercase sm:text-base",
            isLight ? "text-black" : "text-white",
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm transition-transform duration-300",
            open && "rotate-45",
            isLight
              ? "border-black/15 bg-black/5 text-black/60"
              : "border-white/18 bg-white/5 text-white/65",
            open && "border-gold-500 bg-gold-500/15 text-gold-500",
          )}
        >
          +
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          {tag && (
            <span
              className={cn(
                "mb-3 inline-block rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.12em] uppercase",
                highlightTag
                  ? "border-gold-500 bg-gold-500/15 text-gold-400"
                  : isLight
                    ? "border-black/12 bg-black/5 text-black/55"
                    : "border-white/14 bg-white/5 text-white/55",
              )}
            >
              {tag}
            </span>
          )}
          <div
            className={cn(
              "text-sm leading-relaxed sm:text-base",
              isLight ? "text-black/75" : "text-white/78",
            )}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
