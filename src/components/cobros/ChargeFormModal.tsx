"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { crearChargeAction } from "@/lib/actions";
import { chargeSchema, type ChargeData } from "@/lib/schemas";

export function ChargeFormModal({
  open,
  onClose,
  reservationsWithoutCharge,
}: {
  open: boolean;
  onClose: () => void;
  reservationsWithoutCharge: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChargeData>({ resolver: zodResolver(chargeSchema) });

  async function onSubmit(data: ChargeData) {
    setServerError(null);
    const result = await crearChargeAction(data);
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
      title="Registrar cobro"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="charge-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Registrar"}
          </Button>
        </>
      }
    >
      <form id="charge-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select label="Reserva" {...register("reservationId")} error={errors.reservationId?.message}>
          <option value="">Selecciona…</option>
          {reservationsWithoutCharge.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </Select>
        <Input
          type="number"
          label="Monto (MXN)"
          {...register("amount", { valueAsNumber: true })}
          error={errors.amount?.message}
        />
        <Select label="Método de pago" {...register("method")} error={errors.method?.message}>
          <option value="CASH">Efectivo</option>
          <option value="TRANSFER">Transferencia</option>
          <option value="CARD">Tarjeta</option>
        </Select>
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
