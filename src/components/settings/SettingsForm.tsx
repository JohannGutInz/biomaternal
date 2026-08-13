"use client";

import { useState, useTransition } from "react";
import { Check, Copy, ImagePlus, RefreshCw } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { ColorInput } from "@/components/ui/ColorInput";
import { saveSiteSettingsAction, regenerateRegistrationLinkAction, togglePublicRegistrationAction } from "@/lib/actions";
import { settingsSchema, type SettingsData } from "@/lib/schemas";
import type { SiteSettings } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function SettingsForm({ config }: { config: SiteSettings }) {
  const [registrationActive, setRegistrationActive] = useState(config.publicRegistrationActive);
  const [slug, setSlug] = useState(config.registrationLinkSlug);
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

  const registrationUrl = `agencia.com/registro/${slug}`;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      agencyName: config.agencyName,
      primaryColor: config.primaryColor,
      heroTitle: config.heroTitle,
      heroSubtitle: config.heroSubtitle,
    },
  });

  const primaryColor = watch("primaryColor");

  async function onSubmit(data: SettingsData) {
    await saveSiteSettingsAction(data);
  }

  function handleToggleRegistration() {
    const next = !registrationActive;
    setRegistrationActive(next);
    startTransition(() => {
      togglePublicRegistrationAction(next);
    });
  }

  function handleRegenerate() {
    startTransition(async () => {
      const newSlug = await regenerateRegistrationLinkAction();
      setSlug(newSlug);
      setCopied(false);
    });
  }

  function handleCopy() {
    navigator.clipboard?.writeText(registrationUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader title="Identidad del sitio" subtitle="Se refleja en la landing pública." />
        <div className="grid grid-cols-1 gap-5 px-5 pb-5 sm:grid-cols-2">
          <Input label="Nombre de la agencia" {...register("agencyName")} error={errors.agencyName?.message} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Color primario</label>
            <div className="flex items-center gap-2">
              <ColorInput value={primaryColor} onChange={(e) => setValue("primaryColor", e.target.value)} />
              <Input {...register("primaryColor")} className="uppercase" />
            </div>
            {errors.primaryColor && <p className="mt-1 text-xs text-rose-600">{errors.primaryColor.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Logo</label>
            <button
              type="button"
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-8 text-zinc-400 hover:border-brand-400 hover:text-brand-600"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs">Arrastra tu logo o haz clic para subir (PNG/SVG)</span>
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Textos del hero" subtitle="Encabezado principal de la landing." />
        <div className="space-y-4 px-5 pb-5">
          <Input label="Título" {...register("heroTitle")} error={errors.heroTitle?.message} />
          <Textarea label="Subtítulo" {...register("heroSubtitle")} error={errors.heroSubtitle?.message} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Registro público de aspirantes" subtitle="Auto-registro vía link único y regenerable." />
        <div className="space-y-4 px-5 pb-5">
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-4">
            <div>
              <p className="text-sm font-medium text-zinc-800">Link visible en la landing</p>
              <p className="text-xs text-zinc-500">
                {registrationActive
                  ? "Cualquier visitante puede encontrar el formulario de registro."
                  : "El link sigue activo pero solo se comparte en privado."}
              </p>
            </div>
            <Switch checked={registrationActive} onChange={handleToggleRegistration} />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
            <span className="flex-1 truncate text-sm text-zinc-600">{registrationUrl}</span>
            <Button
              variant="ghost"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
              aria-label="Copiar link"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <Button type="button" variant="secondary" onClick={handleRegenerate}>
            <RefreshCw className="h-4 w-4" /> Regenerar link (invalida el anterior)
          </Button>
        </div>
      </Card>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
