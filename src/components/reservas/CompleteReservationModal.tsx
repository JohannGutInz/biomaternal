"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { completarReservationAction } from "@/lib/actions";
import { completeReservationSchema, type CompleteReservationData } from "@/lib/schemas";

export function CompleteReservationModal({
  open,
  onClose,
  reservationId,
  suggestedPrice,
}: {
  open: boolean;
  onClose: () => void;
  reservationId: string | null;
  suggestedPrice?: number | null;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompleteReservationData>({
    resolver: zodResolver(completeReservationSchema),
    values: { reservationId: reservationId ?? "", priceApplied: suggestedPrice ?? undefined, chargeMethod: undefined },
  });

  async function onSubmit(data: CompleteReservationData) {
    if (!reservationId) return;
    setServerError(null);
    const result = await completarReservationAction({ ...data, reservationId });
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
      title="Marcar cita como realizada"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="complete-reservation-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Marcar realizada"}
          </Button>
        </>
      }
    >
      <form id="complete-reservation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-xs text-zinc-500">
          Monto y método son opcionales — si los capturas, se registra el cobro automáticamente (queda pendiente
          de marcar como pagado en Cobros).
        </p>
        <Input
          type="number"
          label="Monto cobrado por la renta (opcional)"
          {...register("priceApplied", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })}
          error={errors.priceApplied?.message}
        />
        <Select
          label="Método de pago (opcional)"
          {...register("chargeMethod", { setValueAs: (v) => (v === "" ? undefined : v) })}
          error={errors.chargeMethod?.message}
        >
          <option value="">Sin especificar</option>
          <option value="CASH">Efectivo</option>
          <option value="TRANSFER">Transferencia</option>
          <option value="CARD">Tarjeta</option>
        </Select>
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
