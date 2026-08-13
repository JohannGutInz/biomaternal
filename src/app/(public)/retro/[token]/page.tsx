import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { getApplicationByToken } from "@/lib/data";
import { ResendApplicationForm } from "@/components/public/ResendApplicationForm";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const application = await getApplicationByToken(token);

  if (!application) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
        <h1 className="mt-4 text-xl font-semibold text-zinc-900">Enlace no encontrado</h1>
        <p className="mt-2 text-sm text-zinc-500">Verifica que copiaste la dirección completa del correo.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-2xl font-light tracking-tight text-zinc-950">Hola, {application.fullName.split(" ")[0]}</h1>

      {application.status === "pendiente" && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-700">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-zinc-400" />
          <p>Tu solicitud está en revisión. Te avisaremos por correo en cuanto tengamos una respuesta.</p>
        </div>
      )}

      {application.status === "aprobado" && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{application.feedbackForModel || "¡Tu solicitud fue aprobada! Pronto te contactaremos."}</p>
        </div>
      )}

      {application.status === "rechazado" && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{application.feedbackForModel || "Gracias por tu interés. En este momento no continuaremos con tu solicitud."}</p>
        </div>
      )}

      {application.status === "requiere_cambios" && (
        <>
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-5 text-sm text-brand-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <p>{application.feedbackForModel}</p>
          </div>
          <div className="mt-8 border-t border-zinc-100 pt-8">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">Actualiza tu información y reenvía</h2>
            <ResendApplicationForm
              token={token}
              fullName={application.fullName}
              email={application.email}
              phone={application.phone}
            />
          </div>
        </>
      )}
    </div>
  );
}
