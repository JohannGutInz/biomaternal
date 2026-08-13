"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Menu, Settings, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/lib/actions";
import type { UserRole } from "@/generated/prisma/browser";
import type { UserW } from "@/lib/types";
import { APP_ROUTE } from "@/lib/routes";

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "admin",
  STAFF: "staff",
  SPECIALIST: "especialista",
};

export function Topbar({
  user,
  notificationCount,
  onMenuClick,
}: {
  user: UserW;
  notificationCount: number;
  onMenuClick: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-zinc-200 bg-white px-6 lg:px-8">
      <Button
        variant="ghost"
        onClick={onMenuClick}
        className="mr-auto h-9 w-9 p-0 text-zinc-500 hover:text-zinc-700 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </Button>

      <Button variant="ghost" className="relative h-9 w-9 p-0 text-zinc-500 hover:text-zinc-700" aria-label="Notificaciones">
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
        {notificationCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        )}
      </Button>

      <div className="h-6 w-px bg-zinc-200" />

      <div className="relative">
        <Button
          variant="ghost"
          onClick={() => setMenuOpen((open) => !open)}
          className="py-1.5 pl-1.5 pr-2"
        >
          <Avatar name={user.username} size="md" />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium text-zinc-900">{user.username}</span>
            <span className="block text-xs text-zinc-500">{ROLE_LABEL[user.role]}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        </Button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1.5 shadow-lg">
              <Link
                href={APP_ROUTE.app.settings.index}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                onClick={() => setMenuOpen(false)}
              >
                <UserRound className="h-4 w-4" /> Mi perfil
              </Link>
              <Link
                href={APP_ROUTE.app.settings.index}
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="h-4 w-4" /> Configuración
              </Link>
              <div className="my-1 h-px bg-zinc-100" />
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="w-full justify-start rounded-none px-3.5 py-2 text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
