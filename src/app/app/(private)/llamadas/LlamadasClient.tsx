"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CallLogFormModal } from "@/components/llamadas/CallLogFormModal";
import type { ClientOption } from "@/components/clients/ClientPicker";
import { APP_ROUTE } from "@/lib/routes";

type CallRow = {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  direction: string;
  isNewContact: boolean;
  generatedAppointment: boolean;
  notes: string | null;
};

const DIRECTION_LABEL: Record<string, string> = { INBOUND: "Entrante", OUTBOUND: "Saliente" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function LlamadasClient({ calls, clients }: { calls: CallRow[]; clients: ClientOption[] }) {
  const [creating, setCreating] = useState(false);

  const contactosNuevos = calls.filter((c) => c.isNewContact).length;
  const citasGeneradas = calls.filter((c) => c.generatedAppointment).length;
  const tasaConversion = contactosNuevos > 0 ? Math.round((citasGeneradas / contactosNuevos) * 100) : 0;

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-5 pb-0">
        <p className="text-xs text-zinc-500">
          {calls.length} llamadas · {contactosNuevos} contactos nuevos · {tasaConversion}% conversión a cita
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Registrar llamada
        </Button>
      </div>

      <div className="mt-4">
        <Table>
          <THead>
            <Th>Fecha</Th>
            <Th>Contacto</Th>
            <Th>Tipo</Th>
            <Th>Contacto nuevo</Th>
            <Th>Generó cita</Th>
          </THead>
          <tbody>
            {calls.map((c) => (
              <Tr key={c.id}>
                <Td>{formatDate(c.date)}</Td>
                <Td className="font-medium text-zinc-900">
                  <Link href={APP_ROUTE.app.clientes.detail(c.clientId)} className="text-brand-700 hover:underline">
                    {c.clientName}
                  </Link>
                </Td>
                <Td>{DIRECTION_LABEL[c.direction] ?? c.direction}</Td>
                <Td>
                  <Badge tone={c.isNewContact ? "success" : "neutral"}>{c.isNewContact ? "Sí" : "No"}</Badge>
                </Td>
                <Td>
                  <Badge tone={c.generatedAppointment ? "success" : "neutral"}>{c.generatedAppointment ? "Sí" : "No"}</Badge>
                </Td>
              </Tr>
            ))}
            {calls.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-zinc-400">Sin llamadas registradas.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <CallLogFormModal open={creating} onClose={() => setCreating(false)} clients={clients} />
    </>
  );
}
