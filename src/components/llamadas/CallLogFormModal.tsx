"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { crearCallLogAction } from "@/lib/actions";
import { callLogSchema, type CallLogData } from "@/lib/schemas";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function CallLogFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CallLogData>({
    resolver: zodResolver(callLogSchema),
    defaultValues: { date: todayInputValue(), direction: "INBOUND", isNewContact: false, generatedAppointment: false },
  });

  async function onSubmit(data: CallLogData) {
    setServerError(null);
    const result = await crearCallLogAction(data);
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    reset({
      date: todayInputValue(),
      direction: "INBOUND",
      isNewContact: false,
      generatedAppointment: false,
      contactName: "",
      notes: "",
    });
    onClose();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar llamada"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="call-log-form" disabled={isSubmitting}>
            {isSubmitting ? "Guardando…" : "Registrar"}
          </Button>
        </>
      }
    >
      <form id="call-log-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input type="date" label="Fecha" {...register("date")} error={errors.date?.message} />
        <Input label="Nombre del contacto" {...register("contactName")} error={errors.contactName?.message} />
        <Select label="Tipo de llamada" {...register("direction")} error={errors.direction?.message}>
          <option value="INBOUND">Entrante</option>
          <option value="OUTBOUND">Saliente</option>
        </Select>
        <Checkbox label="Es un contacto nuevo" {...register("isNewContact")} />
        <Checkbox label="Generó una cita" {...register("generatedAppointment")} />
        <Textarea label="Notas (opcional)" rows={2} {...register("notes")} error={errors.notes?.message} />
        {serverError && <p className="text-sm text-rose-600">{serverError}</p>}
      </form>
    </Modal>
  );
}
