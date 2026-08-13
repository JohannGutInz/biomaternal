"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge, statusTone } from "@/components/ui/Badge";
import { APP_ROUTE } from "@/lib/routes";

type ReservationRow = {
  id: string;
  consultorioName: string;
  sucursalName: string;
  specialistName: string;
  startAt: string;
  endAt: string;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { weekday: "long", day: "2-digit", month: "long" });
}

export function AgendaClient({
  from,
  sucursalId,
  sucursales,
  reservations,
}: {
  from: string;
  sucursalId: string;
  sucursales: { id: string; name: string }[];
  reservations: ReservationRow[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  function updateFilters(next: { desde?: string; sucursal?: string }) {
    const params = new URLSearchParams();
    params.set("desde", next.desde ?? from);
    if (next.sucursal ?? sucursalId) params.set("sucursal", next.sucursal ?? sucursalId);
    router.push(`${pathname}?${params.toString()}`);
  }

  const byDay = useMemo(() => {
    const groups = new Map<string, ReservationRow[]>();
    for (const r of reservations) {
      const key = r.startAt.slice(0, 10);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [reservations]);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 p-5 pb-0">
        <Input
          type="date"
          value={from}
          onChange={(e) => updateFilters({ desde: e.target.value })}
          className="w-auto"
        />
        <Select
          value={sucursalId}
          onChange={(e) => updateFilters({ sucursal: e.target.value })}
          className="w-auto text-zinc-600"
        >
          <option value="">Todas las sucursales</option>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <a
          href={APP_ROUTE.app.reservas.index}
          className="ml-auto text-xs font-medium text-brand-600 hover:underline"
        >
          Ver listado completo de reservas →
        </a>
      </div>

      <div className="mt-4 space-y-6 px-5 pb-5">
        {byDay.length === 0 && (
          <p className="py-10 text-center text-sm text-zinc-400">Sin reservas en este rango de fechas.</p>
        )}
        {byDay.map(([day, items]) => (
          <div key={day}>
            <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">{dayLabel(items[0].startAt)}</p>
            <div className="space-y-2">
              {items
                .sort((a, b) => a.startAt.localeCompare(b.startAt))
                .map((r) => (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-2.5 text-sm">
                    <span className="w-28 shrink-0 font-medium text-zinc-900">
                      {formatTime(r.startAt)} – {formatTime(r.endAt)}
                    </span>
                    <span className="flex-1 truncate text-zinc-600">
                      {r.consultorioName} · {r.sucursalName} — {r.specialistName}
                    </span>
                    <Badge tone={statusTone(r.status)}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
