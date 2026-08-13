import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { SpecialistProfileForm } from "@/components/specialists/SpecialistProfileForm";
import { KycFeedbackModal } from "@/components/specialists/KycFeedbackModal";
import { getOwnSpecialist, getCurrentUser, listSpecialties } from "@/lib/data";
import { signPhotoUrl } from "@/lib/storage";
import { notFound } from "next/navigation";

export default async function SpecialistProfilePage() {
  const user = await getCurrentUser();
  const [specialist, specialties] = await Promise.all([getOwnSpecialist(user.id), listSpecialties()]);

  if (!specialist) notFound();

  const photoUrl = await signPhotoUrl(specialist.photoUrl);

  // Editing is only available once a review has happened: locked while the
  // first review is still pending, and permanently locked after a rejection.
  // REQUIRES_CHANGES stays editable — that status exists specifically so the
  // specialist can fix what was flagged. Mirrored server-side in
  // updateOwnSpecialistProfileAction, since this page-level check is UI only.
  const isLocked = specialist.kyc.status === "PENDING" || specialist.kyc.status === "REJECTED";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {specialist.kyc.status === "PENDING" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">Tu perfil está en revisión</p>
            <p className="mt-1">
              La administración todavía no lo aprueba, así que la edición está bloqueada por ahora. Te avisaremos en
              cuanto haya una respuesta.
            </p>
          </div>
        </div>
      )}

      {specialist.kyc.status === "REQUIRES_CHANGES" && specialist.kyc.comment && (
        <div className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <div>
            <p className="font-medium">Se solicitaron cambios en tu perfil</p>
            <p className="mt-1">{specialist.kyc.comment}</p>
          </div>
        </div>
      )}

      {specialist.kyc.status === "REJECTED" && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Tu perfil fue rechazado</p>
            {specialist.kyc.comment && <p className="mt-1">{specialist.kyc.comment}</p>}
            <p className="mt-1">Ya no es posible editar este perfil. Si crees que es un error, contacta a la administración.</p>
          </div>
        </div>
      )}

      {(specialist.kyc.status === "REQUIRES_CHANGES" || specialist.kyc.status === "REJECTED") && specialist.kyc.comment && (
        <KycFeedbackModal status={specialist.kyc.status} comment={specialist.kyc.comment} />
      )}

      {!isLocked && <SpecialistProfileForm specialist={{ ...specialist, photoUrl }} specialties={specialties} />}
    </div>
  );
}
