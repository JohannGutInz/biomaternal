"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { crearSucursalAction, actualizarSucursalAction } from "@/lib/actions";
import { sucursalSchema, type SucursalData } from "@/lib/schemas";

export interface SucursalFormValues extends SucursalData {
  id?: string;
}

export function SucursalFormModal({
  open,
  onClose,
  sucursal,
}: {
  open: boolean;
  onClose: () => void;
  sucursal?: SucursalFormValues;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SucursalData>({
    resolver: zodResolver(sucursalSchema),
    values: {
      name: sucursal?.name ?? "",
      address: sucursal?.address ?? "",
      phone: sucursal?.phone ?? "",
      timezone: sucursal?.timezone ?? "America/Mazatlan",
      openTime: sucursal?.openTime ?? "09:00",
      closeTime: sucursal?.closeTime ?? "20:00",
      isActive: sucursal?.isActive ?? true,
    },
  });

  async function onSubmit(data: SucursalData) {
    setServerError(null);
    const result = sucursal?.id
      ? await actualizarSucursalAction(sucursal.id, data)
      : await crearSucursalAction(data);
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
      title={sucursal?.id ? "Editar sucursal" : "Nueva sucursal"}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="sucursal-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Guardar"}
          </Button>
        </>
      }
    >
      <form id="sucursal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nombre" {...register("name")} error={errors.name?.message} />
        <Input label="Dirección" {...register("address")} error={errors.address?.message} />
        <Input label="Teléfono" {...register("phone")} error={errors.phone?.message} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Hora de apertura" type="time" {...register("openTime")} error={errors.openTime?.message} />
          <Input label="Hora de cierre" type="time" {...register("closeTime")} error={errors.closeTime?.message} />
        </div>
        <Input label="Zona horaria" {...register("timezone")} error={errors.timezone?.message} />
        <Checkbox label="Sucursal activa" {...register("isActive")} />
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
