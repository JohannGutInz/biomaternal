"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InbodySaleFormModal } from "@/components/inbody/InbodySaleFormModal";
import type { ClientOption } from "@/components/clients/ClientPicker";
import { formatCurrency } from "@/lib/utils";
import { APP_ROUTE } from "@/lib/routes";

type SaleRow = {
  id: string;
  date: string;
  clientId: string;
  clientName: string;
  clientPhone: string | null;
  type: string;
  price: number;
  notes: string | null;
};

const TYPE_LABEL: Record<string, string> = { CORPORATE: "Corporativo", PUBLIC: "Público" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
}

export function InbodyClient({ sales, clients }: { sales: SaleRow[]; clients: ClientOption[] }) {
  const [creating, setCreating] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-5 pb-0">
        <p className="text-xs text-zinc-500">{sales.length} ventas registradas</p>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Registrar venta
        </Button>
      </div>

      <div className="mt-4">
        <Table>
          <THead>
            <Th>Fecha</Th>
            <Th>Cliente</Th>
            <Th>Tipo</Th>
            <Th>Precio</Th>
            <Th>Notas</Th>
          </THead>
          <tbody>
            {sales.map((s) => (
              <Tr key={s.id}>
                <Td>{formatDate(s.date)}</Td>
                <Td className="font-medium text-zinc-900">
                  <Link href={APP_ROUTE.app.clientes.detail(s.clientId)} className="text-brand-700 hover:underline">
                    {s.clientName}
                  </Link>
                  {s.clientPhone && <span className="block text-xs text-zinc-400">{s.clientPhone}</span>}
                </Td>
                <Td>
                  <Badge tone={s.type === "CORPORATE" ? "info" : "neutral"}>{TYPE_LABEL[s.type] ?? s.type}</Badge>
                </Td>
                <Td>{formatCurrency(s.price)}</Td>
                <Td className="text-zinc-500">{s.notes ?? "—"}</Td>
              </Tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-zinc-400">Sin ventas registradas.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <InbodySaleFormModal open={creating} onClose={() => setCreating(false)} clients={clients} />
    </>
  );
}
