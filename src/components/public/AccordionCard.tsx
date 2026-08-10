"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionCardProps {
  title: string;
  tag?: string;
  /**
   * "gradient" — servicios/cobertura: active state turns into a diagonal
   *   pink→black gradient with a pink glow.
   * "solid-dark" / "solid-light" — como-trabajamos/razones/historia: card
   *   stays flat black or white, active state only adds a pink border/glow.
   * "plain" — misión y visión: active state turns solid black, no pink glow
   *   at all (deliberately muted).
   */
  tone?: "gradient" | "solid-dark" | "solid-light" | "plain";
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function AccordionCard({
  title,
  tag,
  tone = "gradient",
  defaultOpen = false,
  children,
}: AccordionCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isLight = tone === "solid-light";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border backdrop-blur-xl transition-all duration-300",
        !open && tone === "gradient" && "border-white/14 bg-black/82 hover:border-white/22",
        !open && tone === "plain" && "border-white/14 bg-black/82 hover:border-white/22",
        !open && tone === "solid-dark" && "border-white/16 bg-black/88 hover:border-white/28",
        !open && tone === "solid-light" && "border-white/95 bg-white hover:border-white",
        open && tone === "gradient" &&
          "border-glam-500 bg-gradient-to-br from-glam-500/24 to-black/94 shadow-[0_20px_60px_rgba(233,0,110,0.24),0_0_0_1px_rgba(233,0,110,0.15)_inset]",
        open && tone === "plain" && "border-[#2a2a2a] bg-black",
        open && tone === "solid-dark" &&
          "border-glam-500 bg-black/94 shadow-[0_20px_60px_rgba(233,0,110,0.28),0_0_0_1px_rgba(233,0,110,0.18)_inset]",
        open && tone === "solid-light" &&
          "border-glam-500 bg-white shadow-[0_20px_60px_rgba(233,0,110,0.22),0_0_0_1px_rgba(233,0,110,0.15)_inset]",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="relative flex w-full items-center justify-center px-14 py-5 text-center"
      >
        <span
          className={cn(
            "block w-full text-sm font-bold tracking-[0.1em] uppercase sm:text-base",
            isLight ? "text-black" : "text-white",
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "absolute top-1/2 right-4 flex shrink-0 -translate-y-1/2 items-center justify-center rounded-full border text-sm transition-transform duration-300",
            tone === "plain" ? "h-6 w-6" : "h-8 w-8",
            open && "rotate-45",
            !open && isLight && "border-black/12 bg-black/4 text-black/60",
            !open && !isLight && "border-white/16 bg-white/4 text-white/70",
            open && "border-glam-500 bg-glam-500/14 text-glam-500",
          )}
        >
          +
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          {tag && (
            <span className="mb-3 inline-block rounded-full border border-glam-500/25 bg-glam-500/8 px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-glam-500 uppercase">
              {tag}
            </span>
          )}
          <div
            className={cn(
              "text-left text-sm leading-relaxed sm:text-base",
              isLight ? "text-black/76" : "text-white/84",
            )}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
