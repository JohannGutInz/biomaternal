"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { APP_ROUTE } from "@/lib/routes";
import { NAV_GROUPS } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

const LS_KEY = "nav-collapsed-groups";

function readCollapsed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveCollapsed(groups: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...groups]));
  } catch {}
}

export function Sidebar({
  collapsed,
  onToggle,
  pendingCount,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  pendingCount: number;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(readCollapsed);

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      saveCollapsed(next);
      return next;
    });
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-900/60 bg-zinc-950 transition-transform duration-300 lg:z-40 lg:translate-x-0 lg:transition-[width] lg:duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        {/* Logo / toggle */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/5 px-4">
          <Button
            variant="ghost"
            onClick={onToggle}
            className="hidden h-9 w-9 shrink-0 p-0 text-zinc-400 hover:bg-white/5 hover:text-brand-300 lg:flex"
            aria-label="Contraer o expandir menú"
          >
            {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
          </Button>
          <Link
            href={APP_ROUTE.app.dashboard.index}
            className={cn("truncate text-lg font-semibold leading-none text-white", collapsed && "lg:hidden")}
          >
            Bio<span className="text-brand-400">maternal</span>
          </Link>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Cerrar menú"
            className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/5 hover:text-brand-300 lg:hidden"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group, idx) => (
            <div key={group.label ?? idx}>
              {group.label ? (
                <p
                  className={cn(
                    "mb-2 px-3 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase",
                    collapsed && "lg:hidden",
                  )}
                >
                  {group.label}
                </p>
              ) : null}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                  const showBadge = item.href === APP_ROUTE.app.moderation.index && pendingCount > 0;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-white/[0.08] text-brand-300"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
                          collapsed && "lg:justify-center",
                        )}
                      >
                        {active && (
                          <span className="absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-brand-400" />
                        )}
                        <item.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                        <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
                        {showBadge && (
                          <span
                            className={cn(
                              "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-semibold text-zinc-950",
                              collapsed && "lg:hidden",
                            )}
                          >
                            {pendingCount}
                          </span>
                        )}
                        {collapsed && showBadge && (
                          <span className="absolute top-1 right-1.5 hidden h-2 w-2 rounded-full bg-brand-400 lg:block" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className={cn("border-t border-white/5 p-4 text-[11px] text-zinc-500", collapsed && "lg:hidden")}>
          <p>Biomaternal · v1</p>
          <p className="mt-0.5">Backoffice interno — no indexado</p>
        </div>
      </aside>
    </>
  );
}
