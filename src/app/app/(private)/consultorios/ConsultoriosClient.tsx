"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConsultorioFormModal, type ConsultorioFormValues } from "@/components/consultorios/ConsultorioFormModal";
import { formatCurrency } from "@/lib/utils";

type ConsultorioRow = ConsultorioFormValues & { id: string; sucursalName: string };

export function ConsultoriosClient({
  consultorios,
  sucursales,
}: {
  consultorios: ConsultorioRow[];
  sucursales: { id: string; name: string }[];
}) {
  const [editing, setEditing] = useState<ConsultorioRow | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-5 pb-0">
        <p className="text-xs text-zinc-500">{consultorios.length} consultorios</p>
        <Button onClick={() => setCreating(true)} disabled={sucursales.length === 0}>
          <Plus className="h-4 w-4" /> Nuevo consultorio
        </Button>
      </div>
      {sucursales.length === 0 && (
        <p className="px-5 pt-2 text-xs text-amber-600">Crea al menos una sucursal antes de agregar consultorios.</p>
      )}

      <div className="mt-4">
        <Table>
          <THead>
            <Th>Nombre</Th>
            <Th>Sucursal</Th>
            <Th>Tarifa/hora</Th>
            <Th>Tarifa/jornada</Th>
            <Th>Estado</Th>
            <Th>{""}</Th>
          </THead>
          <tbody>
            {consultorios.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium text-zinc-900">{c.name}</Td>
                <Td>{c.sucursalName}</Td>
                <Td>{c.hourlyRate != null ? formatCurrency(c.hourlyRate) : "—"}</Td>
                <Td>{c.dayRate != null ? formatCurrency(c.dayRate) : "—"}</Td>
                <Td>
                  <Badge tone={c.isActive ? "success" : "neutral"}>{c.isActive ? "Activo" : "Inactivo"}</Badge>
                </Td>
                <Td className="text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(c)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-brand-600"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                </Td>
              </Tr>
            ))}
            {consultorios.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-zinc-400">Sin consultorios todavía.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <ConsultorioFormModal open={creating} onClose={() => setCreating(false)} sucursales={sucursales} />
      <ConsultorioFormModal
        open={!!editing}
        onClose={() => setEditing(null)}
        consultorio={editing ?? undefined}
        sucursales={sucursales}
      />
    </>
  );
}
