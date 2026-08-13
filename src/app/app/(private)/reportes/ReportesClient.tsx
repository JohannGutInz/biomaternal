"use client";

import { useRouter, usePathname } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Table, THead, Th, Tr, Td } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import type { getReporteSemanal, getReportePorEspecialista } from "@/lib/data";

type ReporteSemanal = Awaited<ReturnType<typeof getReporteSemanal>>;
type PorEspecialistaRow = Awaited<ReturnType<typeof getReportePorEspecialista>>[number];

function pct(ratio: number) {
  return `${Math.round(ratio * 100)}%`;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

export function ReportesClient({
  desde,
  hasta,
  sucursalId,
  sucursales,
  semanal,
  porEspecialista,
}: {
  desde: string;
  hasta: string;
  sucursalId: string;
  sucursales: { id: string; name: string }[];
  semanal: ReporteSemanal;
  porEspecialista: PorEspecialistaRow[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  function applyFilters(next: { desde?: string; hasta?: string; sucursal?: string }) {
    const params = new URLSearchParams();
    params.set("desde", next.desde ?? desde);
    params.set("hasta", next.hasta ?? hasta);
    const suc = next.sucursal ?? sucursalId;
    if (suc) params.set("sucursal", suc);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-end gap-3">
          <Input type="date" label="Desde" defaultValue={desde} onChange={(e) => applyFilters({ desde: e.target.value })} />
          <Input type="date" label="Hasta" defaultValue={hasta} onChange={(e) => applyFilters({ hasta: e.target.value })} />
          <Select label="Sucursal (solo afecta reservas)" defaultValue={sucursalId} onChange={(e) => applyFilters({ sucursal: e.target.value })}>
            <option value="">Todas</option>
            {sucursales.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Button variant="secondary" onClick={() => applyFilters({})}>
            Actualizar
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader title="Ingreso total del negocio" className="p-0 pb-3" />
        <p className="text-3xl font-semibold text-zinc-900">{formatCurrency(semanal.ingresoTotal)}</p>
        <p className="mt-1 text-xs text-zinc-500">Renta de consultorios + InBody vendido fuera de consulta.</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader title="Flujo de pacientes" className="p-0 pb-3" />
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Citas agendadas" value={semanal.flujoPacientes.citasAgendadas} />
            <Stat label="Citas realizadas" value={semanal.flujoPacientes.citasEfectivas} />
            <Stat label="Cancelaciones" value={semanal.flujoPacientes.cancelaciones} />
            <Stat label="Pospuestas" value={semanal.flujoPacientes.pospuestas} />
            <Stat label="Horas rentadas" value={semanal.flujoPacientes.horasRentadas.toFixed(1)} />
            <Stat label="Ingreso por renta" value={formatCurrency(semanal.flujoPacientes.ingresoRenta)} />
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Agenda WhatsApp" className="p-0 pb-3" />
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Solicitudes" value={semanal.agendaWhatsapp.solicitudes} />
            <Stat label="Concretadas" value={semanal.agendaWhatsapp.concretadas} />
            <Stat label="No concretadas" value={semanal.agendaWhatsapp.noConcretadas} />
            <Stat label="Tasa de cierre" value={pct(semanal.agendaWhatsapp.tasaCierre)} />
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Llamadas y conversión" className="p-0 pb-3" />
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Total de llamadas" value={semanal.conversion.totalLlamadas} />
            <Stat label="Contactos nuevos" value={semanal.conversion.contactosNuevos} />
            <Stat label="Citas generadas" value={semanal.conversion.citasGeneradas} />
            <Stat label="Tasa de conversión" value={pct(semanal.conversion.tasaConversion)} />
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="InBody" className="p-0 pb-3" />
          <div className="grid grid-cols-2 gap-4">
            <Stat label="En consulta" value={semanal.inbody.enConsulta} />
            <Stat label="Corporativos" value={semanal.inbody.corporativo} />
            <Stat label="Públicos" value={semanal.inbody.publico} />
            <Stat label="Ingreso externos" value={formatCurrency(semanal.inbody.ingresoExternos)} />
            <Stat label="Total InBody" value={semanal.inbody.total} />
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <CardHeader title="Flujo B2B" className="p-0 pb-3" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Interesados" value={semanal.flujoB2b.interesados} />
            <Stat label="En negociación" value={semanal.flujoB2b.enNegociacion} />
            <Stat label="Confirmados" value={semanal.flujoB2b.confirmados} />
            <Stat label="Incidencias de agenda" value={semanal.flujoB2b.incidenciasAgenda} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Reporte por especialista" subtitle="Una fila por cada especialista del catálogo." />
        <Table>
          <THead>
            <Th>Especialista</Th>
            <Th>Especialidad</Th>
            <Th>Agendadas</Th>
            <Th>Realizadas</Th>
            <Th>Canceladas</Th>
            <Th>Pospuestas</Th>
            <Th>Horas</Th>
            <Th>Ingreso renta</Th>
            <Th>Citas WhatsApp</Th>
          </THead>
          <tbody>
            {porEspecialista.map((row) => (
              <Tr key={row.specialistId}>
                <Td className="font-medium text-zinc-900">{row.name}</Td>
                <Td className="text-zinc-500">{row.specialtyNames || "—"}</Td>
                <Td>{row.citasAgendadas}</Td>
                <Td>{row.realizadas}</Td>
                <Td>{row.canceladas}</Td>
                <Td>{row.pospuestas}</Td>
                <Td>{row.horas.toFixed(1)}</Td>
                <Td>{formatCurrency(row.ingresoRenta)}</Td>
                <Td>{row.citasWhatsapp}</Td>
              </Tr>
            ))}
            {porEspecialista.length === 0 && (
              <tr>
                <Td className="py-10 text-center text-zinc-400">Sin especialistas registrados.</Td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
