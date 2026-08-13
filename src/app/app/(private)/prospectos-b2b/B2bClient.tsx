"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge, statusTone } from "@/components/ui/Badge";
import { B2bProspectFormModal } from "@/components/b2b/B2bProspectFormModal";
import { actualizarB2bProspectStatusAction } from "@/lib/actions";
import { APP_ROUTE } from "@/lib/routes";

type ProspectRow = {
  id: string;
  date: string;
  specialistName: string;
  specialtyName: string | null;
  status: string;
  scheduleIncident: boolean;
  notes: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  INTERESTED: "Interesado",
  NEGOTIATING: "En negociación",
  CONFIRMED: "Confirmado",
  DISCARDED: "Descartado",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function B2bClient({
  prospects,
  specialties,
}: {
  prospects: ProspectRow[];
  specialties: { id: string; name: string }[];
}) {
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();

  function changeStatus(id: string, status: "INTERESTED" | "NEGOTIATING" | "CONFIRMED" | "DISCARDED") {
    startTransition(() => {
      actualizarB2bProspectStatusAction(id, status);
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-5 pb-0">
        <p className="text-xs text-zinc-500">{prospects.length} prospectos</p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Registrar prospecto
        </Button>
      </div>

      <div className="mt-4">
        <Table>
          <THead>
            <Th>Fecha</Th>
            <Th>Especialista</Th>
            <Th>Especialidad</Th>
            <Th>Estatus</Th>
            <Th>Incidencia agenda</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {prospects.map((p) => (
              <Tr key={p.id}>
                <Td>{formatDate(p.date)}</Td>
                <Td className="font-medium text-zinc-900">{p.specialistName}</Td>
                <Td>{p.specialtyName ?? <span className="text-zinc-300">—</span>}</Td>
                <Td>
                  <Badge tone={statusTone(p.status)}>{STATUS_LABEL[p.status] ?? p.status}</Badge>
                </Td>
                <Td>
                  {p.scheduleIncident ? <Badge tone="warning">Sí</Badge> : <span className="text-zinc-300">—</span>}
                </Td>
                <Td className="text-right">
                  {p.status === "CONFIRMED" ? (
                    <a href={APP_ROUTE.app.specialists.new} className="text-xs font-medium text-brand-700 hover:underline">
                      Dar de alta →
                    </a>
                  ) : (
                    <Select
                      value={p.status}
                      onChange={(e) => changeStatus(p.id, e.target.value as "INTERESTED" | "NEGOTIATING" | "CONFIRMED" | "DISCARDED")}
                      className="w-auto text-xs"
                    >
                      {Object.entries(STATUS_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </Select>
                  )}
                </Td>
              </Tr>
            ))}
            {prospects.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-zinc-400">Sin prospectos registrados.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <B2bProspectFormModal open={creating} onClose={() => setCreating(false)} specialties={specialties} />
    </>
  );
}
