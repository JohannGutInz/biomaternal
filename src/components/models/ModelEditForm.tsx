"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, User } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { MultiSelectPicker } from "@/components/ui/MultiSelectPicker";
import { Button } from "@/components/ui/Button";
import { ModelMediaFields, type ModelMediaFieldsHandle } from "@/components/models/ModelMediaFields";
import { updateModelAttributesAction } from "@/lib/actions";
import { modelEditSchema, type ModelEditData } from "@/lib/schemas";
import { APP_ROUTE } from "@/lib/routes";
import type { ModelWithRelations } from "@/lib/data";
import {
  getMainPhotoUrl,
  getGalleryVideos,
  getCasualPhotos,
  getBookPhotos,
  getEventPhotos,
  getCampaignVideoLinks,
} from "@/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PantsSizeScale, ShirtSize } from "@/generated/prisma/enums";

interface Option {
  id: string;
  name: string;
}

export function ModelEditForm({
  model,
  categories,
}: {
  model: ModelWithRelations;
  categories: Option[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const mediaFieldsRef = useRef<ModelMediaFieldsHandle>(null);

  const mainPhotoUrl = getMainPhotoUrl(model.assets);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ModelEditData>({
    resolver: zodResolver(modelEditSchema),
    defaultValues: {
      firstName: model.firstName,
      paternalLastName: model.paternalLastName,
      maternalLastName: model.maternalLastName ?? "",
      phone: model.phone,
      mainPhotoUrl: mainPhotoUrl ?? "",
      casualPhotoUrls: getCasualPhotos(model.media),
      bookPhotoUrls: getBookPhotos(model.media),
      eventPhotoUrls: getEventPhotos(model.media),
      presentationVideoUrl: getGalleryVideos(model.assets)[0] ?? "",
      campaignVideoLinks: getCampaignVideoLinks(model.media),
      height: model.height ?? undefined,
      currentWeight: model.currentWeight ?? undefined,
      hasVisibleTattoos: model.hasVisibleTattoos,
      shirtSize: model.shirtSize ?? undefined,
      pantsSizeScale: model.pantsSizeScale ?? undefined,
      pantsSize: model.pantsSize ?? "",
      travelAvailability: model.travelAvailability,
      hasPassport: model.hasPassport,
      hasVisa: model.hasVisa,
      categoryIds: model.categories.map((c) => c.id),
      hiddenFromCatalog: model.hiddenFromCatalog,
    },
  });

  const categoryIds = watch("categoryIds");
  const casualPhotoUrls = watch("casualPhotoUrls");
  const bookPhotoUrls = watch("bookPhotoUrls");
  const eventPhotoUrls = watch("eventPhotoUrls");
  const presentationVideoUrl = watch("presentationVideoUrl");
  const campaignVideoLinks = watch("campaignVideoLinks");

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
    setPendingPhoto(file);
    setPhotoRemoved(false);
    e.target.value = "";
  }

  function handleAvatarRemove() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setPendingPhoto(null);
    setPhotoRemoved(true);
  }

  const displayAvatar = avatarPreview ?? (photoRemoved ? null : mainPhotoUrl);

  async function onSubmit(data: ModelEditData) {
    setServerError(null);

    let newMainPhotoUrl = mainPhotoUrl ?? "";

    if (pendingPhoto) {
      const formData = new FormData();
      formData.append("file", pendingPhoto);
      formData.append("modelId", model.id);

      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const uploadResult = await res.json();
      if (!res.ok) {
        setServerError(uploadResult.error ?? "Error al subir la imagen.");
        return;
      }
      newMainPhotoUrl = uploadResult.url;
    } else if (photoRemoved) {
      newMainPhotoUrl = "";
    }

    let resolvedMedia = {
      casualPhotoUrls: data.casualPhotoUrls,
      bookPhotoUrls: data.bookPhotoUrls,
      eventPhotoUrls: data.eventPhotoUrls,
      presentationVideoUrl: data.presentationVideoUrl,
    };

    try {
      resolvedMedia = (await mediaFieldsRef.current?.resolvePending()) ?? resolvedMedia;
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Error al subir archivos.");
      return;
    }

    const result = await updateModelAttributesAction(model.id, {
      ...data,
      mainPhotoUrl: newMainPhotoUrl,
      ...resolvedMedia,
    });
    if (result.status === "error") {
      setServerError(result.message);
      return;
    }
    router.push(`${APP_ROUTE.app.models.index}/${model.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader title="Foto de perfil" />
        <div className="flex items-center gap-4 px-5 pb-5">
          <div className="group relative">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-20 w-20 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100"
            >
              {displayAvatar ? (
                <Image src={displayAvatar} alt="Foto de perfil" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-8 w-8 text-zinc-400" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-zinc-950/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          {displayAvatar && (
            <button
              type="button"
              onClick={handleAvatarRemove}
              className="text-xs text-zinc-400 underline hover:text-rose-500"
            >
              Eliminar foto
            </button>
          )}
        </div>
      </Card>

      <ModelMediaFields
        ref={mediaFieldsRef}
        modelId={model.id}
        casualPhotos={{
          value: casualPhotoUrls,
          onChange: (urls) => setValue("casualPhotoUrls", urls, { shouldValidate: true }),
          error: errors.casualPhotoUrls?.message,
        }}
        bookPhotos={{
          value: bookPhotoUrls,
          onChange: (urls) => setValue("bookPhotoUrls", urls, { shouldValidate: true }),
          error: errors.bookPhotoUrls?.message,
        }}
        eventPhotos={{
          value: eventPhotoUrls,
          onChange: (urls) => setValue("eventPhotoUrls", urls, { shouldValidate: true }),
          error: errors.eventPhotoUrls?.message,
        }}
        presentationVideo={{
          value: presentationVideoUrl ?? "",
          onChange: (url) => setValue("presentationVideoUrl", url, { shouldValidate: true }),
          error: errors.presentationVideoUrl?.message,
        }}
        campaignLinks={{
          value: campaignVideoLinks,
          onChange: (urls) => setValue("campaignVideoLinks", urls, { shouldValidate: true }),
          error: errors.campaignVideoLinks?.message,
        }}
      />

      <Card>
        <CardHeader title="Datos de contacto" />
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2">
          <Input
            label="Nombre(s)"
            defaultValue={model.firstName}
            {...register("firstName")}
            error={errors.firstName?.message}
          />
          <Input
            label="Apellido paterno"
            defaultValue={model.paternalLastName}
            {...register("paternalLastName")}
            error={errors.paternalLastName?.message}
          />
          <Input
            label="Apellido materno"
            defaultValue={model.maternalLastName ?? ""}
            {...register("maternalLastName")}
            error={errors.maternalLastName?.message}
          />
          <Input
            label="Teléfono"
            defaultValue={model.phone}
            {...register("phone")}
            error={errors.phone?.message}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Atributos físicos" />
        <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2">
          <Input
            type="number"
            label="Estatura (cm)"
            defaultValue={model.height ?? ""}
            {...register("height", { valueAsNumber: true })}
            error={errors.height?.message}
          />
          <Input
            type="number"
            label="Peso actual (kg)"
            defaultValue={model.currentWeight ?? ""}
            {...register("currentWeight", { valueAsNumber: true })}
            error={errors.currentWeight?.message}
          />
          <Select
            label="Talla de camisa"
            {...register("shirtSize")}
            defaultValue={model.shirtSize ?? ""}
            placeholder="Selecciona…"
            error={errors.shirtSize?.message}
          >
            {Object.entries(ShirtSize).map((size) => <option key={size[0]} value={size[0]}>{size[1]}</option>)}
          </Select>
          <div />
          <Select
            label="Escala de talla de pantalón"
            {...register("pantsSizeScale")}
            defaultValue={model.pantsSizeScale ?? ""}
            placeholder="Selecciona…"
            error={errors.pantsSizeScale?.message}
          >
            <option value={PantsSizeScale.MEN}>Hombre</option>
            <option value={PantsSizeScale.WOMEN}>Mujer</option>
          </Select>
          <Input
            label="Talla de pantalón"
            defaultValue={model.pantsSize ?? ""}
            {...register("pantsSize")}
            error={errors.pantsSize?.message}
          />
          <div className="sm:col-span-2">
            <Checkbox
              label="¿Tiene tatuajes visibles?"
              defaultChecked={model.hasVisibleTattoos}
              {...register("hasVisibleTattoos")}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Disponibilidad" />
        <div className="space-y-3 px-5 pb-5">
          <Checkbox
            label="Disponibilidad para viajar"
            defaultChecked={model.travelAvailability}
            {...register("travelAvailability")}
          />
          <Checkbox label="¿Cuenta con pasaporte?" defaultChecked={model.hasPassport} {...register("hasPassport")} />
          <Checkbox label="¿Cuenta con visa?" defaultChecked={model.hasVisa} {...register("hasVisa")} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Categorías" />
        <div className="px-5 pb-5">
          <Controller
            name="categoryIds"
            control={control}
            render={() => (
              <MultiSelectPicker
                label="Categorías"
                hint="(mínimo 1)"
                options={categories}
                selectedIds={categoryIds}
                onChange={(ids) => setValue("categoryIds", ids)}
                error={errors.categoryIds?.message}
              />
            )}
          />
        </div>
      </Card>

      <Card>
        <CardHeader title="Visibilidad" />
        <div className="px-5 pb-5">
          <Checkbox
            label="Ocultar este perfil del catálogo público de modelos"
            defaultChecked={model.hiddenFromCatalog}
            {...register("hiddenFromCatalog")}
          />
        </div>
      </Card>

      {serverError && <p className="text-sm text-rose-600">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
