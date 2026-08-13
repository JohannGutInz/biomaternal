import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone, User, Pencil } from "lucide-react";
import { getModel } from "@/lib/data";
import { signAssetUrls } from "@/lib/storage";
import { ModelVisibilityToggle } from "@/components/models/ModelVisibilityToggle";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, FieldGrid } from "@/components/ui/Field";
import { LinkButton } from "@/components/ui/Button";
import { APP_ROUTE } from "@/lib/routes";
import {
  calculateAge,
  formatDate,
  formatFullName,
  getMainPhotoUrl,
  getGalleryVideos,
  getCasualPhotos,
  getBookPhotos,
  getEventPhotos,
  getCampaignVideoLinks,
} from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

const SHIRT_SIZE_LABEL: Record<string, string> = {
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
};

const PANTS_SCALE_LABEL: Record<string, string> = {
  MEN: "Hombre",
  WOMEN: "Mujer",
};

function yesNo(value: boolean): string {
  return value ? "Sí" : "No";
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = await getModel(id);

  if (!model) notFound();

  model.assets = await signAssetUrls(model.assets);
  model.media = await signAssetUrls(model.media);

  const mainPhotoUrl = getMainPhotoUrl(model.assets);
  const presentationVideoUrl = getGalleryVideos(model.assets)[0] ?? null;
  const casualPhotos = getCasualPhotos(model.media);
  const bookPhotos = getBookPhotos(model.media);
  const eventPhotos = getEventPhotos(model.media);
  const campaignVideoLinks = getCampaignVideoLinks(model.media);

  return (
    <div>
      <Link
        href={APP_ROUTE.app.models.index}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Modelos
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {mainPhotoUrl ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
              <Image src={mainPhotoUrl} alt={formatFullName(model)} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <Avatar name={formatFullName(model)} size="lg" />
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                {formatFullName(model)}
              </h1>
              <ModelVisibilityToggle modelId={model.id} hiddenFromCatalog={model.hiddenFromCatalog} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {GENRE_LABEL[model.genre] ?? model.genre}
              </span>
              <span>·</span>
              <span>{calculateAge(model.birthDate)} años</span>
            </div>
          </div>
        </div>
        <LinkButton href={APP_ROUTE.app.models.edit.id(model.id)} variant="secondary">
          <Pencil className="h-4 w-4" /> Editar
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Datos personales" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Nombre completo" value={formatFullName(model)} />
                <Field
                  label="Fecha de nacimiento"
                  value={`${formatDate(model.birthDate)} · ${calculateAge(model.birthDate)} años`}
                />
                <Field label="Género" value={GENRE_LABEL[model.genre] ?? model.genre} />
              </FieldGrid>
            </div>
          </Card>

          <Card>
            <CardHeader title="Atributos físicos" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Estatura" value={model.height ? `${model.height} cm` : "Sin definir"} />
                <Field label="Peso actual" value={model.currentWeight ? `${model.currentWeight} kg` : "Sin definir"} />
                <Field label="Tatuajes visibles" value={yesNo(model.hasVisibleTattoos)} />
                <Field label="Talla de camisa" value={model.shirtSize ? SHIRT_SIZE_LABEL[model.shirtSize] : "Sin definir"} />
                <Field
                  label="Talla de pantalón"
                  value={
                    model.pantsSizeScale && model.pantsSize
                      ? `${PANTS_SCALE_LABEL[model.pantsSizeScale]} · ${model.pantsSize}`
                      : "Sin definir"
                  }
                />
              </FieldGrid>
            </div>
          </Card>

          <Card>
            <CardHeader title="Logística" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Disponibilidad para viajar" value={yesNo(model.travelAvailability)} />
                <Field label="Pasaporte" value={yesNo(model.hasPassport)} />
                <Field label="Visa" value={yesNo(model.hasVisa)} />
              </FieldGrid>
            </div>
          </Card>

          <Card>
            <CardHeader title="Contacto" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Correo
                    </span>
                  }
                  value={model.email}
                />
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Teléfono
                    </span>
                  }
                  value={
                    <span className="inline-flex items-center gap-2">
                      {model.phone}
                      <a
                        href={`https://wa.me/${model.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Contactar por WhatsApp"
                        className="inline-flex items-center justify-center rounded-full p-1 text-emerald-600 hover:bg-emerald-50"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    </span>
                  }
                />
              </FieldGrid>
            </div>
          </Card>

          {casualPhotos.length > 0 && (
            <Card>
              <CardHeader title="Fotos caseras" />
              <div className="grid grid-cols-3 gap-3 px-5 pb-5 sm:grid-cols-4">
                {casualPhotos.map((url) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200">
                    <Image src={url} alt="Foto casera" fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {bookPhotos.length > 0 && (
            <Card>
              <CardHeader title="Fotos de book" />
              <div className="grid grid-cols-3 gap-3 px-5 pb-5 sm:grid-cols-4">
                {bookPhotos.map((url) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200">
                    <Image src={url} alt="Foto de book" fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {eventPhotos.length > 0 && (
            <Card>
              <CardHeader title="Fotos de eventos" />
              <div className="grid grid-cols-3 gap-3 px-5 pb-5 sm:grid-cols-4">
                {eventPhotos.map((url) => (
                  <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200">
                    <Image src={url} alt="Foto de evento" fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(presentationVideoUrl || campaignVideoLinks.length > 0) && (
            <Card>
              <CardHeader title="Video" />
              <div className="space-y-4 px-5 pb-5">
                {presentationVideoUrl && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-zinc-400">Video de presentación</p>
                    <video src={presentationVideoUrl} controls className="w-full rounded-lg" />
                  </div>
                )}
                {campaignVideoLinks.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-zinc-400">Links a videos de campañas</p>
                    <ul className="space-y-1.5">
                      {campaignVideoLinks.map((url) => (
                        <li key={url}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-sm text-brand-700 underline hover:text-brand-600"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Ubicación" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Municipio
                    </span>
                  }
                  value={model.city.name}
                />
                <Field label="Estado" value={model.city.state.name} />
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <User className="h-3 w-3" /> País
                    </span>
                  }
                  value={model.country.name}
                />
                <Field label="Nacionalidad" value={model.country.demonym} />
              </FieldGrid>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {model.categories.length > 0 && (
            <Card>
              <CardHeader title="Categorías" />
              <div className="px-5 pb-5">
                <div className="flex flex-wrap gap-2">
                  {model.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader title="Identificación interna" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="ID" value={<span className="font-mono text-xs">{model.id}</span>} />
              </FieldGrid>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
