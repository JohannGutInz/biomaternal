"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { crearConsultorioAction, actualizarConsultorioAction } from "@/lib/actions";
import { consultorioSchema, type ConsultorioData } from "@/lib/schemas";

export interface ConsultorioFormValues extends ConsultorioData {
  id?: string;
}

export function ConsultorioFormModal({
  open,
  onClose,
  consultorio,
  sucursales,
}: {
  open: boolean;
  onClose: () => void;
  consultorio?: ConsultorioFormValues;
  sucursales: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConsultorioData>({
    resolver: zodResolver(consultorioSchema),
    values: {
      sucursalId: consultorio?.sucursalId ?? sucursales[0]?.id ?? "",
      name: consultorio?.name ?? "",
      floor: consultorio?.floor ?? "",
      description: consultorio?.description ?? "",
      hourlyRate: consultorio?.hourlyRate,
      dayRate: consultorio?.dayRate,
      isActive: consultorio?.isActive ?? true,
    },
  });

  async function onSubmit(data: ConsultorioData) {
    setServerError(null);
    const result = consultorio?.id
      ? await actualizarConsultorioAction(consultorio.id, data)
      : await crearConsultorioAction(data);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    reset();
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={consultorio?.id ? "Editar consultorio" : "Nuevo consultorio"}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="consultorio-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar"}
          </Button>
        </>
      }
    >
      <form id="consultorio-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="Sucursal" {...register("sucursalId")} error={errors.sucursalId?.message}>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
        <Input label="Nombre / número" {...register("name")} error={errors.name?.message} />
        <Input label="Piso (opcional)" {...register("floor")} error={errors.floor?.message} />
        <Input label="Descripción (opcional)" {...register("description")} error={errors.description?.message} />
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Tarifa por hora (MXN)"
            {...register("hourlyRate", { valueAsNumber: true })}
            error={errors.hourlyRate?.message}
          />
          <Input
            type="number"
            label="Tarifa por jornada (MXN)"
            {...register("dayRate", { valueAsNumber: true })}
            error={errors.dayRate?.message}
          />
        </div>
        <Checkbox label="Consultorio activo" {...register("isActive")} />
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
