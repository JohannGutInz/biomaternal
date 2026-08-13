"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModelPortalNav() {
  const pathname = usePathname();

  const tabs = [{ href: "/app/modelo/perfil", label: "Mi perfil", Icon: User }];

  return (
    <nav className="border-b border-zinc-200 bg-white px-4 lg:px-8">
      <div className="mx-auto flex max-w-2xl">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-2 px-3 py-3.5 text-sm font-medium transition-colors sm:flex-none sm:justify-start",
                "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-[background]",
                active
                  ? "text-zinc-950 after:bg-gold-500"
                  : "text-zinc-500 hover:text-zinc-700 after:bg-transparent",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
