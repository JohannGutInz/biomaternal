"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { cancelarReservationAction } from "@/lib/actions";
import { cancelReservationSchema, type CancelReservationData } from "@/lib/schemas";

export function CancelReservationModal({
  open,
  onClose,
  reservationId,
}: {
  open: boolean;
  onClose: () => void;
  reservationId: string | null;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CancelReservationData>({ resolver: zodResolver(cancelReservationSchema) });

  async function onSubmit(data: CancelReservationData) {
    if (!reservationId) return;
    setServerError(null);
    const result = await cancelarReservationAction({ ...data, reservationId });
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
      title="Cancelar reserva"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Volver
          </Button>
          <Button type="submit" form="cancel-reservation-form" variant="secondary" disabled={isSubmitting}>
            {isSubmitting ? "Cancelando…" : "Cancelar reserva"}
          </Button>
        </>
      }
    >
      <form id="cancel-reservation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Textarea
          label="Motivo de cancelación"
          rows={3}
          {...register("cancellationReason")}
          error={errors.cancellationReason?.message}
        />
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
