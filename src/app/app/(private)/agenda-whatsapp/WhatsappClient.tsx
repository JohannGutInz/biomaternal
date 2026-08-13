"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WhatsappRequestFormModal } from "@/components/whatsapp/WhatsappRequestFormModal";

type RequestRow = {
  id: string;
  date: string;
  contact: string;
  specialistName: string | null;
  confirmed: boolean;
  declineReason: string | null;
  notes: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function WhatsappClient({
  requests,
  specialists,
}: {
  requests: RequestRow[];
  specialists: { id: string; name: string }[];
}) {
  const [creating, setCreating] = useState(false);

  const concretadas = requests.filter((r) => r.confirmed).length;
  const tasaCierre = requests.length > 0 ? Math.round((concretadas / requests.length) * 100) : 0;

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-5 pb-0">
        <p className="text-xs text-zinc-500">
          {requests.length} solicitudes · {concretadas} concretadas · {tasaCierre}% tasa de cierre
        </p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Registrar solicitud
        </Button>
      </div>

      <div className="mt-4">
        <Table>
          <THead>
            <Th>Fecha</Th>
            <Th>Contacto</Th>
            <Th>Especialista solicitado</Th>
            <Th>Se concretó</Th>
            <Th>Detalle</Th>
          </THead>
          <tbody>
            {requests.map((r) => (
              <Tr key={r.id}>
                <Td>{formatDate(r.date)}</Td>
                <Td className="font-medium text-zinc-900">{r.contact}</Td>
                <Td>{r.specialistName ?? <span className="text-zinc-300">—</span>}</Td>
                <Td>
                  <Badge tone={r.confirmed ? "success" : "danger"}>{r.confirmed ? "Sí" : "No"}</Badge>
                </Td>
                <Td className="text-zinc-500">{(r.confirmed ? r.notes : r.declineReason) ?? "—"}</Td>
              </Tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-zinc-400">Sin solicitudes registradas.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <WhatsappRequestFormModal open={creating} onClose={() => setCreating(false)} specialists={specialists} />
    </>
  );
}
