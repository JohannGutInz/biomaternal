"use client";

import { useState } from "react";
import type { ActionState } from "@/lib/actions";
import { specialtySchema, type SpecialtyData } from "@/lib/schemas";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface CatalogFormProps {
  title: string;
  subtitle: string;
  action: (data: SpecialtyData) => Promise<ActionState>;
  placeholder?: string;
}

export function CatalogForm({ title, subtitle, action, placeholder = "Ej. Nutrición, Pediatría, Psicología…" }: CatalogFormProps) {
  const [serverMessage, setServerMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SpecialtyData>({ resolver: zodResolver(specialtySchema) });

  async function onSubmit(data: SpecialtyData) {
    setServerMessage(null);
    const result = await action(data);
    if (result.status === "success") {
      reset();
      setServerMessage({ type: "success", text: result.message });
    } else {
      setServerMessage({ type: "error", text: result.message });
    }
  }

  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-5 pb-5">
        <Input
          id="name"
          label="Nombre"
          {...register("name")}
          type="text"
          placeholder={placeholder}
          error={errors.name?.message}
        />

        {serverMessage && (
          <p className={`text-sm ${serverMessage.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
            {serverMessage.text}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Crear catálogo"}
        </Button>
      </form>
    </Card>
  );
}
