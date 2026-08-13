"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { ChargeFormModal } from "@/components/cobros/ChargeFormModal";
import { actualizarChargeStatusAction } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";

type ChargeRow = {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  consultorioName: string;
  specialistName: string;
};

const METHOD_LABEL: Record<string, string> = { CASH: "Efectivo", TRANSFER: "Transferencia", CARD: "Tarjeta" };
const STATUS_LABEL: Record<string, string> = { PENDING: "Pendiente", PAID: "Pagado", WAIVED: "Condonado" };

export function CobrosClient({
  charges,
  reservationsWithoutCharge,
}: {
  charges: ChargeRow[];
  reservationsWithoutCharge: { id: string; label: string }[];
}) {
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();

  function markPaid(id: string) {
    startTransition(() => {
      actualizarChargeStatusAction(id, "PAID");
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-5 pb-0">
        <p className="text-xs text-zinc-500">{charges.length} cobros</p>
        <Button onClick={() => setCreating(true)} disabled={reservationsWithoutCharge.length === 0}>
          <Plus className="h-4 w-4" /> Registrar cobro
        </Button>
      </div>
      {reservationsWithoutCharge.length === 0 && (
        <p className="px-5 pt-2 text-xs text-zinc-400">No hay reservas confirmadas/completadas sin cobro registrado.</p>
      )}

      <div className="mt-4">
        <Table>
          <THead>
            <Th>Consultorio</Th>
            <Th>Especialista</Th>
            <Th>Monto</Th>
            <Th>Método</Th>
            <Th>Estado</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {charges.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium text-zinc-900">{c.consultorioName}</Td>
                <Td>{c.specialistName}</Td>
                <Td>{formatCurrency(c.amount)}</Td>
                <Td>{METHOD_LABEL[c.method] ?? c.method}</Td>
                <Td>
                  <Badge tone={statusTone(c.status)}>{STATUS_LABEL[c.status] ?? c.status}</Badge>
                </Td>
                <Td className="text-right">
                  {c.status === "PENDING" && (
                    <button type="button" onClick={() => markPaid(c.id)} className="text-xs font-medium text-emerald-600 hover:underline">
                      Marcar pagado
                    </button>
                  )}
                </Td>
              </Tr>
            ))}
            {charges.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-zinc-400">Sin cobros registrados.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ChargeFormModal open={creating} onClose={() => setCreating(false)} reservationsWithoutCharge={reservationsWithoutCharge} />
    </>
  );
}
