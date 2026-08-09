"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitContactAction } from "@/lib/actions";
import { contactSchema, type ContactData } from "@/lib/schemas";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function ContactForm({ defaultMessage }: { defaultMessage?: string }) {
  const [success, setSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { message: defaultMessage ?? "" },
  });

  async function onSubmit(data: ContactData) {
    setServerError(null);
    const result = await submitContactAction(data);
    if (result.status === "error") setServerError(result.message);
    else setSuccess(result.message);
  }

  if (success) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-300">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Nombre" labelClassName="text-white" {...register("name")} error={errors.name?.message} />
        <Input label="Empresa" labelClassName="text-white" {...register("company")} />
      </div>

      <Input
        label="Correo"
        labelClassName="text-white"
        type="email"
        {...register("email")}
        error={errors.email?.message}
      />

      <Textarea
        label="Mensaje"
        labelClassName="text-white"
        {...register("message")}
        rows={5}
        error={errors.message?.message}
      />

      {serverError && <p className="text-sm text-rose-400">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="rounded-full px-5">
        {isSubmitting ? "Enviando…" : "Enviar mensaje"} <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
