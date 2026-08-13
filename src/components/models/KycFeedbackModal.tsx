"use client";

import { useState } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

// Deliberately has no backdrop-click or Escape dismissal (dismissable=false)
// — the model has to read the agency's comment and explicitly close it
// before doing anything else on the page.
export function KycFeedbackModal({
  status,
  comment,
}: {
  status: "REQUIRES_CHANGES" | "REJECTED";
  comment: string;
}) {
  const [open, setOpen] = useState(true);

  const isRejected = status === "REJECTED";

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      dismissable={false}
      footer={
        <Button type="button" onClick={() => setOpen(false)}>
          Entendido
        </Button>
      }
    >
      <div className="flex items-start gap-3">
        {isRejected ? (
          <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" />
        ) : (
          <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-brand-500" />
        )}
        <div>
          <p className="font-semibold text-zinc-900">
            {isRejected ? "Tu perfil fue rechazado" : "La agencia solicitó cambios en tu perfil"}
          </p>
          <p className="mt-2 text-sm whitespace-pre-wrap text-zinc-600">{comment}</p>
        </div>
      </div>
    </Modal>
  );
}
