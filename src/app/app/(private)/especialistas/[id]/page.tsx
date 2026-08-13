import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone, Pencil } from "lucide-react";
import { getSpecialist } from "@/lib/data";
import { signPhotoUrl } from "@/lib/storage";
import { SpecialistVisibilityToggle } from "@/components/specialists/SpecialistVisibilityToggle";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, FieldGrid } from "@/components/ui/Field";
import { LinkButton } from "@/components/ui/Button";
import { APP_ROUTE } from "@/lib/routes";
import { calculateAge, formatDate, formatFullName } from "@/lib/utils";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

export default async function SpecialistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const specialist = await getSpecialist(id);

  if (!specialist) notFound();

  const photoUrl = await signPhotoUrl(specialist.photoUrl);

  return (
    <div>
      <Link
        href={APP_ROUTE.app.specialists.index}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Especialistas
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
              <Image src={photoUrl} alt={formatFullName(specialist)} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <Avatar name={formatFullName(specialist)} size="lg" />
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                {formatFullName(specialist)}
              </h1>
              <SpecialistVisibilityToggle specialistId={specialist.id} isPublic={specialist.isPublic} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                {GENRE_LABEL[specialist.genre] ?? specialist.genre}
              </span>
              <span>·</span>
              <span>{calculateAge(specialist.birthDate)} años</span>
            </div>
          </div>
        </div>
        <LinkButton href={APP_ROUTE.app.specialists.edit.id(specialist.id)} variant="secondary">
          <Pencil className="h-4 w-4" /> Editar
        </LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Datos personales" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="Nombre completo" value={formatFullName(specialist)} />
                <Field
                  label="Fecha de nacimiento"
                  value={`${formatDate(specialist.birthDate)} · ${calculateAge(specialist.birthDate)} años`}
                />
                <Field label="Género" value={GENRE_LABEL[specialist.genre] ?? specialist.genre} />
                <Field label="Cédula profesional" value={specialist.licenseNumber ?? "Sin definir"} />
              </FieldGrid>
            </div>
          </Card>

          {specialist.bio && (
            <Card>
              <CardHeader title="Biografía" />
              <div className="px-5 pb-5 text-sm whitespace-pre-wrap text-zinc-700">{specialist.bio}</div>
            </Card>
          )}

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
                  value={specialist.email}
                />
                <Field
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Teléfono
                    </span>
                  }
                  value={
                    <span className="inline-flex items-center gap-2">
                      {specialist.phone}
                      <a
                        href={`https://wa.me/${specialist.phone.replace(/\D/g, "")}`}
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
                {specialist.location && (
                  <Field
                    label={
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Ubicación
                      </span>
                    }
                    value={specialist.location}
                  />
                )}
              </FieldGrid>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {specialist.specialties.length > 0 && (
            <Card>
              <CardHeader title="Especialidades" />
              <div className="px-5 pb-5">
                <div className="flex flex-wrap gap-2">
                  {specialist.specialties.map((sp) => (
                    <span
                      key={sp.id}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700"
                    >
                      {sp.name}
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
                <Field label="ID" value={<span className="font-mono text-xs">{specialist.id}</span>} />
              </FieldGrid>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
