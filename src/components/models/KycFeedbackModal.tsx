"use client";

import { useState } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Deliberately has no backdrop-click or Escape dismissal — the model has to
// read the agency's comment and explicitly close it before doing anything
// else on the page.
export function KycFeedbackModal({
  status,
  comment,
}: {
  status: "REQUIRES_CHANGES" | "REJECTED";
  comment: string;
}) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const isRejected = status === "REJECTED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          {isRejected ? (
            <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" />
          ) : (
            <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-gold-500" />
          )}
          <div>
            <p className="font-semibold text-zinc-900">
              {isRejected ? "Tu perfil fue rechazado" : "La agencia solicitó cambios en tu perfil"}
            </p>
            <p className="mt-2 text-sm whitespace-pre-wrap text-zinc-600">{comment}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={() => setOpen(false)}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}
