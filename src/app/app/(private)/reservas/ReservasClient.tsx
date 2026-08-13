"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ReservationFormModal } from "@/components/reservas/ReservationFormModal";
import { cambiarStatusReservationAction } from "@/lib/actions";

type ReservationRow = {
  id: string;
  consultorioName: string;
  sucursalName: string;
  specialistName: string;
  type: string;
  startAt: string;
  endAt: string;
  status: string;
  hasCharge: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
  NO_SHOW: "No se presentó",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function ReservasClient({
  reservations,
  consultorios,
  specialists,
}: {
  reservations: ReservationRow[];
  consultorios: { id: string; name: string; sucursalName: string }[];
  specialists: { id: string; name: string }[];
}) {
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [, startTransition] = useTransition();

  const filtered = useMemo(
    () => (statusFilter === "todos" ? reservations : reservations.filter((r) => r.status === statusFilter)),
    [reservations, statusFilter],
  );

  function changeStatus(id: string, status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW") {
    startTransition(() => {
      cambiarStatusReservationAction(id, status);
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-0">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-auto text-zinc-600">
          <option value="todos">Todos los estados</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Button onClick={() => setCreating(true)} disabled={consultorios.length === 0 || specialists.length === 0}>
          <Plus className="h-4 w-4" /> Nueva reserva
        </Button>
      </div>
      {(consultorios.length === 0 || specialists.length === 0) && (
        <p className="px-5 pt-2 text-xs text-amber-600">
          Necesitas al menos un consultorio activo y un especialista aprobado para crear reservas.
        </p>
      )}

      <div className="mt-4">
        <Table>
          <THead>
            <Th>Consultorio</Th>
            <Th>Especialista</Th>
            <Th>Tipo</Th>
            <Th>Inicio</Th>
            <Th>Fin</Th>
            <Th>Estado</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {filtered.map((r) => (
              <Tr key={r.id}>
                <Td className="font-medium text-zinc-900">
                  {r.consultorioName}
                  <span className="block text-xs text-zinc-400">{r.sucursalName}</span>
                </Td>
                <Td>{r.specialistName}</Td>
                <Td>{r.type === "FULL_DAY" ? "Jornada" : "Por hora"}</Td>
                <Td>{formatDateTime(r.startAt)}</Td>
                <Td>{formatDateTime(r.endAt)}</Td>
                <Td>
                  <Badge tone={statusTone(r.status)}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                </Td>
                <Td className="text-right">
                  {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                    <div className="flex justify-end gap-2 text-xs font-medium">
                      {r.status === "PENDING" && (
                        <button type="button" onClick={() => changeStatus(r.id, "CONFIRMED")} className="text-emerald-600 hover:underline">
                          Confirmar
                        </button>
                      )}
                      <button type="button" onClick={() => changeStatus(r.id, "COMPLETED")} className="text-zinc-500 hover:underline">
                        Completar
                      </button>
                      <button type="button" onClick={() => changeStatus(r.id, "NO_SHOW")} className="text-amber-600 hover:underline">
                        No-show
                      </button>
                      <button type="button" onClick={() => changeStatus(r.id, "CANCELLED")} className="text-rose-600 hover:underline">
                        Cancelar
                      </button>
                    </div>
                  )}
                </Td>
              </Tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-zinc-400">Sin reservas en este estado.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ReservationFormModal open={creating} onClose={() => setCreating(false)} consultorios={consultorios} specialists={specialists} />
    </>
  );
}
