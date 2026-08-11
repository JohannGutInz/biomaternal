import { AlertTriangle, Clock, XCircle } from "lucide-react";
import { ModelProfileForm } from "@/components/models/ModelProfileForm";
import { KycFeedbackModal } from "@/components/models/KycFeedbackModal";
import { getOwnModel, getCurrentUser, listCategories } from "@/lib/data";
import { signAssetUrls } from "@/lib/storage";
import { notFound } from "next/navigation";

export default async function ModelProfilePage() {
  const user = await getCurrentUser();
  const [model, categories] = await Promise.all([getOwnModel(user.id), listCategories()]);

  if (!model) notFound();

  model.assets = await signAssetUrls(model.assets);
  model.media = await signAssetUrls(model.media);

  // Editing is only available once a review has happened: locked while the
  // first review is still pending, and permanently locked after a rejection.
  // REQUIRES_CHANGES stays editable — that status exists specifically so the
  // model can fix what the agency flagged. Mirrored server-side in
  // updateOwnModelProfileAction, since this page-level check is UI only.
  const isLocked = model.kyc.status === "PENDING" || model.kyc.status === "REJECTED";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {model.kyc.status === "PENDING" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">Tu perfil está en revisión</p>
            <p className="mt-1">
              La agencia todavía no lo aprueba, así que la edición está bloqueada por ahora. Te avisaremos en cuanto
              haya una respuesta.
            </p>
          </div>
        </div>
      )}

      {model.kyc.status === "REQUIRES_CHANGES" && model.kyc.comment && (
        <div className="flex items-start gap-3 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
          <div>
            <p className="font-medium">La agencia solicitó cambios en tu perfil</p>
            <p className="mt-1">{model.kyc.comment}</p>
          </div>
        </div>
      )}

      {model.kyc.status === "REJECTED" && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Tu perfil fue rechazado</p>
            {model.kyc.comment && <p className="mt-1">{model.kyc.comment}</p>}
            <p className="mt-1">Ya no es posible editar este perfil. Si crees que es un error, contacta a la agencia.</p>
          </div>
        </div>
      )}

      {(model.kyc.status === "REQUIRES_CHANGES" || model.kyc.status === "REJECTED") && model.kyc.comment && (
        <KycFeedbackModal status={model.kyc.status} comment={model.kyc.comment} />
      )}

      {!isLocked && <ModelProfileForm model={model} categories={categories} />}
    </div>
  );
}
