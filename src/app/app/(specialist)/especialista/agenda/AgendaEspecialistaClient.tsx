"use client";

import { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { ReservationSelfFormModal } from "@/components/specialists/ReservationSelfFormModal";
import type { ClientOption } from "@/components/clients/ClientPicker";
import { formatCurrency } from "@/lib/utils";

type ReservationRow = {
  id: string;
  consultorioName: string;
  sucursalName: string;
  clientName: string | null;
  type: string;
  startAt: string;
  endAt: string;
  status: string;
  priceApplied: number | null;
  chargeStatus: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Realizada",
  NO_SHOW: "No se presentó",
  POSTPONED: "Pospuesta",
};

const CHARGE_LABEL: Record<string, string> = {
  PENDING: "Cobro pendiente",
  PAID: "Pagado",
  WAIVED: "Condonado",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function AgendaEspecialistaClient({
  canReserve,
  reservations,
  consultorios,
  clients,
}: {
  canReserve: boolean;
  reservations: ReservationRow[];
  consultorios: { id: string; name: string; sucursalName: string }[];
  clients: ClientOption[];
}) {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Mi agenda</h1>
        <Button onClick={() => setCreating(true)} disabled={!canReserve || consultorios.length === 0}>
          <Plus className="h-4 w-4" /> Apartar consultorio
        </Button>
      </div>

      <Card>
        <CardHeader title="Mis reservas" subtitle={reservations.length === 0 ? "Todavía no has apartado ningún consultorio." : undefined} />
        {reservations.length > 0 && (
          <ul className="divide-y divide-zinc-100">
            {reservations.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">{r.consultorioName}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin className="h-3 w-3" /> {r.sucursalName}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatDateTime(r.startAt)} – {formatDateTime(r.endAt)} · {r.type === "FULL_DAY" ? "Jornada" : "Por hora"}
                  </p>
                  {r.clientName && <p className="mt-1 text-xs text-zinc-500">Paciente: {r.clientName}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Badge tone={statusTone(r.status)}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                  {r.priceApplied != null && (
                    <span className="text-xs font-medium text-zinc-600">{formatCurrency(r.priceApplied)}</span>
                  )}
                  <span className="text-[11px] text-zinc-400">
                    {r.chargeStatus ? CHARGE_LABEL[r.chargeStatus] ?? r.chargeStatus : "Sin cobro registrado"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ReservationSelfFormModal open={creating} onClose={() => setCreating(false)} consultorios={consultorios} clients={clients} />
    </>
  );
}
