"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Exact copy of the client's approved mockup nav (website/*.html): one "MENÚ ▾"
// button, one flat dropdown panel, same link order and dividers on every page.
const MENU_GROUP_1 = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/cobertura", label: "Cobertura" },
  { href: "/talentos", label: "Nuestro catálogo/portafolio" },
  { href: "/como-trabajamos", label: "¿Cómo trabajamos?" },
  { href: "/razones", label: "¿Por qué elegir a Glamour Models?" },
];

const MENU_GROUP_2 = [
  { href: "/mision-vision", label: "Filosofía, Misión y Visión" },
  { href: "/historia", label: "Historia y evolución" },
];

const MENU_GROUP_3_CONTACT = { href: "/contacto", label: "Contáctanos" };

export function PublicHeader({
  publicRegistrationActive,
}: {
  publicRegistrationActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function linkClass(href: string) {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return cn(
      "block w-full rounded-xl px-3.5 py-3.5 text-left text-[11px] tracking-[0.16em] text-white/78 uppercase transition-colors hover:bg-white/7 hover:text-white",
      isActive && "border border-glam-500/35 bg-glam-500/20 text-glam-500 shadow-[0_0_0_1px_rgba(233,0,110,0.1)_inset] hover:bg-glam-500/28",
    );
  }

  return (
    <header className="fixed top-0 z-40 w-full border-b border-white/6 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-5 px-6">
        <div ref={rootRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-haspopup="menu"
            className="rounded-full border border-white/14 bg-white/4 px-5 py-2.5 text-[12.5px] tracking-[0.26em] text-white uppercase backdrop-blur-md transition-all hover:-translate-y-px hover:border-glam-500 hover:bg-glam-500/8 hover:text-glam-500"
          >
            Menú ▾
          </button>

          {open && (
            <div
              role="menu"
              className="absolute top-[calc(100%+14px)] left-0 flex w-[84vw] max-w-[320px] flex-col gap-0.5 rounded-[18px] border border-white/10 bg-[rgba(10,10,10,0.92)] p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:left-0"
            >
              {MENU_GROUP_1.map((link) => (
                <Link key={link.href} href={link.href} role="menuitem" onClick={() => setOpen(false)} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              ))}

              <div className="my-1.5 h-px bg-white/8" />

              {MENU_GROUP_2.map((link) => (
                <Link key={link.href} href={link.href} role="menuitem" onClick={() => setOpen(false)} className={linkClass(link.href)}>
                  {link.label}
                </Link>
              ))}

              <div className="my-1.5 h-px bg-white/8" />

              {publicRegistrationActive && (
                <Link href="/registro" role="menuitem" onClick={() => setOpen(false)} className={linkClass("/registro")}>
                  ¡Únete a nuestro equipo!
                </Link>
              )}
              <Link
                href={MENU_GROUP_3_CONTACT.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={linkClass(MENU_GROUP_3_CONTACT.href)}
              >
                {MENU_GROUP_3_CONTACT.label}
              </Link>
            </div>
          )}
        </div>

        <div className="w-[100px]" aria-hidden />
        <div className="w-[100px]" aria-hidden />
      </div>
    </header>
  );
}
