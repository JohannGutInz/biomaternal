import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { getSpecialistKyc } from "@/lib/data";
import { signPhotoUrl } from "@/lib/storage";
import { moderateKycAction } from "@/lib/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, FieldGrid } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "@/components/ui/Badge";
import { addDays, calculateAge, formatDate, formatFullName } from "@/lib/utils";
import { APP_ROUTE } from "@/lib/routes";

const GENRE_LABEL: Record<string, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
};

export default async function VerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const specialist = await getSpecialistKyc(id);

  if (!specialist) notFound();

  const photoUrl = await signPhotoUrl(specialist.photoUrl);
  const { kyc } = specialist;
  const age = calculateAge(specialist.birthDate);
  const purgeDate = kyc.rejectedAt ? addDays(kyc.rejectedAt, 45) : null;
  const canReview = kyc.status !== "APPROVED" && kyc.status !== "REJECTED";

  return (
    <div>
      <Link
        href={APP_ROUTE.app.verification.index}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Verificación
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
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{formatFullName(specialist)}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <StatusBadge status={kyc.status} />
              <span>·</span>
              <span>Enviado el {formatDate(kyc.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {age < 18 && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <AlertTriangle className="h-4 w-4" /> Esta solicitud indica una edad menor a 18 años — no procesar.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Datos del registro" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field
                  label={<span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> Correo</span>}
                  value={specialist.email}
                />
                <Field
                  label={<span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</span>}
                  value={specialist.phone}
                />
                <Field
                  label="Fecha de nacimiento"
                  value={`${formatDate(specialist.birthDate)} · ${age} años`}
                />
                <Field label="Género" value={GENRE_LABEL[specialist.genre] ?? specialist.genre} />
                <Field label="Cédula profesional" value={specialist.licenseNumber ?? "Sin definir"} />
                {specialist.location && (
                  <Field
                    label={<span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Ubicación</span>}
                    value={specialist.location}
                  />
                )}
              </FieldGrid>
            </div>
          </Card>

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

          {specialist.bio && (
            <Card>
              <CardHeader title="Biografía" />
              <div className="px-5 pb-5 text-sm whitespace-pre-wrap text-zinc-700">{specialist.bio}</div>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Revisión de verificación"
              subtitle="El comentario es visible para el especialista. La nota interna es solo para staff."
            />
            <form className="space-y-4 px-5 pb-5">
              <Textarea
                label="Nota interna · solo staff"
                labelClassName="text-xs font-semibold tracking-wide text-zinc-500 uppercase"
                name="internalNote"
                defaultValue={kyc.internalNote ?? ""}
                placeholder="Observaciones internas, nunca visibles para el especialista…"
                className="border-zinc-200 bg-zinc-50 text-zinc-700 focus:border-zinc-400 focus:ring-zinc-400"
              />
              <Textarea
                label="Comentario para el especialista · visible en su notificación"
                labelClassName="text-xs font-semibold tracking-wide text-brand-700 uppercase"
                name="comment"
                defaultValue={kyc.comment ?? ""}
                placeholder="Lo que el especialista recibirá como retroalimentación…"
                className="border-brand-200 bg-brand-50 text-brand-900 focus:border-brand-400 focus:ring-brand-400"
              />

              {canReview && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    type="submit"
                    variant="secondary"
                    formAction={moderateKycAction.bind(null, specialist.id, "REJECTED")}
                    className="hover:bg-rose-50 hover:text-rose-700 hover:ring-rose-200"
                  >
                    <XCircle className="h-4 w-4" /> Rechazar
                  </Button>
                  <Button
                    type="submit"
                    variant="secondary"
                    formAction={moderateKycAction.bind(null, specialist.id, "REQUIRES_CHANGES")}
                    className="hover:bg-amber-50 hover:text-amber-700 hover:ring-amber-200"
                  >
                    <RotateCcw className="h-4 w-4" /> Solicitar cambios
                  </Button>
                  <Button type="submit" formAction={moderateKycAction.bind(null, specialist.id, "APPROVED")}>
                    <CheckCircle2 className="h-4 w-4" /> Aprobar
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Estado del ciclo de vida" />
            <div className="px-5 pb-5 text-sm text-zinc-600 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-zinc-400" />
                <span>Registrado el {formatDate(kyc.createdAt)}</span>
              </div>
              {kyc.reviewedAt && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Revisado el {formatDate(kyc.reviewedAt)}</span>
                </div>
              )}
              {kyc.status === "REJECTED" && purgeDate && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Rechazado el {formatDate(kyc.rejectedAt!)}. Datos se purgarán el{" "}
                    <strong>{formatDate(purgeDate)}</strong>.
                  </span>
                </div>
              )}
              {kyc.status === "APPROVED" && (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">
                  Especialista aprobado — forma parte del directorio.
                </div>
              )}
              {kyc.status === "REQUIRES_CHANGES" && kyc.comment && (
                <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                  <p className="font-medium mb-1">Comentario enviado:</p>
                  <p>{kyc.comment}</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Historial de revisiones"
              subtitle={kyc.reviewLogs.length === 0 ? "Sin revisiones todavía." : undefined}
            />
            {kyc.reviewLogs.length > 0 && (
              <div className="space-y-3 px-5 pb-5">
                {kyc.reviewLogs.map((log) => (
                  <div key={log.id} className="rounded-lg border border-zinc-200 p-3 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={log.decision} />
                      <span className="text-zinc-400">{formatDate(log.reviewedAt)}</span>
                    </div>
                    <p className="mt-2 text-zinc-500">
                      {log.reviewedBy ? `Por ${log.reviewedBy}` : "Admin sin identificar"}
                    </p>
                    {log.comment ? (
                      <p className="mt-1.5 text-zinc-700">{log.comment}</p>
                    ) : (
                      <p className="mt-1.5 text-zinc-400 italic">Sin comentario</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Identificación" />
            <div className="px-5 pb-5">
              <FieldGrid>
                <Field label="ID especialista" value={<span className="font-mono text-xs">{specialist.id}</span>} />
                <Field label="ID verificación" value={<span className="font-mono text-xs">{kyc.id}</span>} />
              </FieldGrid>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
