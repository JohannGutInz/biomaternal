"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Camera, MapPin, User } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { MultiSelectPicker } from "@/components/ui/MultiSelectPicker";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ModelMediaFields, type ModelMediaFieldsHandle } from "@/components/models/ModelMediaFields";
import { ImageCropModal } from "@/components/models/ImageCropModal";
import { updateOwnModelProfileAction } from "@/lib/actions";
import { ownModelProfileSchema, type OwnModelProfileData } from "@/lib/schemas";
import type { OwnModelWithKyc } from "@/lib/data";
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

const KYC_BADGE: Record<string, { label: string; className: string }> = {
  PENDING: { label: "En revisión", className: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Aprobado", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rechazado", className: "bg-rose-50 text-rose-700 border-rose-200" },
  REQUIRES_CHANGES: { label: "Requiere cambios", className: "bg-brand-50 text-brand-700 border-brand-200" },
};

interface Category {
  id: string;
  name: string;
}

export function ModelProfileForm({
  model,
  categories,
}: {
  model: NonNullable<OwnModelWithKyc>;
  categories: Category[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const [confirmApprovedSave, setConfirmApprovedSave] = useState<OwnModelProfileData | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const avatarRawFile = useRef<File | null>(null);
  const mediaFieldsRef = useRef<ModelMediaFieldsHandle>(null);

  const mainPhotoUrl = getMainPhotoUrl(model.assets);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OwnModelProfileData>({
    resolver: zodResolver(ownModelProfileSchema),
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
    },
  });

  const firstName = watch("firstName");
  const paternalLastName = watch("paternalLastName");
  const categoryIds = watch("categoryIds");
  const casualPhotoUrls = watch("casualPhotoUrls");
  const bookPhotoUrls = watch("bookPhotoUrls");
  const eventPhotoUrls = watch("eventPhotoUrls");
  const presentationVideoUrl = watch("presentationVideoUrl");
  const campaignVideoLinks = watch("campaignVideoLinks");

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    avatarRawFile.current = file;
    const src = URL.createObjectURL(file);
    setAvatarCropSrc(src);
    e.target.value = "";
  }

  function handleAvatarCropConfirm(blob: Blob, previewUrl: string) {
    if (avatarCropSrc) URL.revokeObjectURL(avatarCropSrc);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarCropSrc(null);
    setAvatarPreview(previewUrl);
    setPendingPhoto(new File([blob], avatarRawFile.current?.name ?? "photo.webp", { type: "image/webp" }));
    setPhotoRemoved(false);
  }

  function handleAvatarCropCancel() {
    if (avatarCropSrc) URL.revokeObjectURL(avatarCropSrc);
    setAvatarCropSrc(null);
    avatarRawFile.current = null;
  }

  function handleAvatarRemove() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    setPendingPhoto(null);
    setPhotoRemoved(true);
  }

  const displayAvatar = avatarPreview ?? (photoRemoved ? null : mainPhotoUrl);
  const kycBadge = KYC_BADGE[model.kyc.status] ?? KYC_BADGE.PENDING;

  async function doSave(data: OwnModelProfileData) {

    setMessage(null);

    let newMainPhotoUrl = mainPhotoUrl ?? "";

    if (pendingPhoto) {
      const formData = new FormData();
      formData.append("file", pendingPhoto);
      formData.append("modelId", model.id);

      const res = await fetch("/api/upload/image", { method: "POST", body: formData });
      const uploadResult = await res.json();
      if (!res.ok) {
        setMessage(uploadResult.error ?? "Error al subir la imagen.");
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
      setMessage(err instanceof Error ? err.message : "Error al subir archivos.");
      return;
    }

    const result = await updateOwnModelProfileAction({
      ...data,
      mainPhotoUrl: newMainPhotoUrl,
      ...resolvedMedia,
    });
    setMessage(result.message);
    setConfirmApprovedSave(null);
  }

  async function onSubmit(data: OwnModelProfileData) {
    if (model.kyc.status === "APPROVED") {
      setConfirmApprovedSave(data);
      return;
    }
    await doSave(data);
  }

  return (
    <>
    {/* Approve-then-save confirmation modal */}
    <Modal
      open={!!confirmApprovedSave}
      onClose={() => setConfirmApprovedSave(null)}
      size="sm"
      title="¿Guardar cambios?"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => setConfirmApprovedSave(null)}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => confirmApprovedSave && doSave(confirmApprovedSave)}>
            Sí, guardar
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-500">
        Tu perfil ya está aprobado. Si guardas estos cambios, deberá aprobarse de nuevo por la agencia.
      </p>
    </Modal>

    {/* Avatar crop modal */}
    {avatarCropSrc && (
      <ImageCropModal
        src={avatarCropSrc}
        aspect={1}
        onConfirm={handleAvatarCropConfirm}
        onCancel={handleAvatarCropCancel}
      />
    )}

    <form id="model-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-20 sm:pb-0">
      {/* ── Profile hero ── */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700" />

        {/* Avatar + info */}
        <div className="relative -mt-14 flex flex-col items-center px-6 pb-8">
          {/* Circular avatar with edit overlay */}
          <div className="group relative">
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-zinc-200 shadow-lg transition"
            >
              {displayAvatar ? (
                <Image src={displayAvatar} alt="Foto de perfil" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-10 w-10 text-zinc-400" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-zinc-950/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
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
              className="mt-1.5 text-xs text-zinc-400 underline hover:text-rose-500"
            >
              Eliminar foto
            </button>
          )}

          {/* Name */}
          <h2 className="mt-3 text-xl font-semibold text-zinc-900">
            {(firstName || model.firstName)} {(paternalLastName || model.paternalLastName)}
          </h2>
          <p className="text-sm text-zinc-400">{model.email}</p>

          {/* City */}
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
            <MapPin className="h-3.5 w-3.5" />
            {model.city.name}, {model.country.name}
          </p>

          {/* Chips row */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${kycBadge.className}`}>
              {kycBadge.label}
            </span>
            {model.height && (
              <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs text-zinc-600">
                {model.height} cm
              </span>
            )}
            {model.currentWeight && (
              <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs text-zinc-600">
                {model.currentWeight} kg
              </span>
            )}
            <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs text-zinc-600">
              {model.genre === "FEMALE" ? "Mujer" : "Hombre"}
            </span>
          </div>
        </div>
      </div>

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

      {/* ── Datos de contacto ── */}
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
          <Input label="Correo" disabled value={model.email} />
          <div className="sm:col-span-2">
            <Input label="Teléfono" defaultValue={model.phone} {...register("phone")} error={errors.phone?.message} />
          </div>
        </div>
      </Card>

      {/* ── Atributos físicos ── */}
      <Card>
        <CardHeader title="Atributos físicos" subtitle="Necesarios para que tu perfil entre a revisión." />
        <div className="grid grid-cols-2 gap-4 px-5 pb-5 sm:grid-cols-3">
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
          <div className="hidden sm:block" />
          <Select
            label="Talla de camisa"
            {...register("shirtSize")}
            defaultValue={model.shirtSize ?? ""}
            placeholder="Selecciona…"
            error={errors.shirtSize?.message}
          >
            {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select
            label="Escala pantalón"
            {...register("pantsSizeScale")}
            defaultValue={model.pantsSizeScale ?? ""}
            placeholder="Selecciona…"
            error={errors.pantsSizeScale?.message}
          >
            <option value="MEN">Hombre</option>
            <option value="WOMEN">Mujer</option>
          </Select>
          <Input
            label="Talla de pantalón"
            defaultValue={model.pantsSize ?? ""}
            {...register("pantsSize")}
            error={errors.pantsSize?.message}
          />
          <div className="col-span-2 sm:col-span-3">
            <Checkbox
              label="¿Tienes tatuajes visibles?"
              defaultChecked={model.hasVisibleTattoos}
              {...register("hasVisibleTattoos")}
            />
          </div>
        </div>
      </Card>

      {/* ── Disponibilidad ── */}
      <Card>
        <CardHeader title="Disponibilidad" />
        <div className="grid grid-cols-1 gap-3 px-5 pb-5 sm:grid-cols-3">
          <Checkbox
            label="Disponible para viajar"
            defaultChecked={model.travelAvailability}
            {...register("travelAvailability")}
          />
          <Checkbox label="Tengo pasaporte" defaultChecked={model.hasPassport} {...register("hasPassport")} />
          <Checkbox label="Tengo visa" defaultChecked={model.hasVisa} {...register("hasVisa")} />
        </div>
      </Card>

      {/* ── Categorías ── */}
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

      {message && (
        <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          {message}
        </p>
      )}

      <div className="hidden justify-end pb-4 sm:flex">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </form>

    {/* Floating save bar — mobile only, always visible */}
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:hidden">
      <button
        type="submit"
        form="model-profile-form"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-zinc-950 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:pointer-events-none disabled:opacity-50"
      >
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
    </>
  );
}
