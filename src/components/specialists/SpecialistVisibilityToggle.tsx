"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/Switch";
import { toggleSpecialistVisibilityAction } from "@/lib/actions";

export function SpecialistVisibilityToggle({
  specialistId,
  isPublic,
}: {
  specialistId: string;
  isPublic: boolean;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(isPublic);
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange() {
    const next = !visible;
    setVisible(next);
    setIsSaving(true);
    const result = await toggleSpecialistVisibilityAction(specialistId, next);
    setIsSaving(false);
    if (result.status === "error") {
      setVisible(!next);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Switch checked={visible} onChange={handleChange} disabled={isSaving} size="sm" aria-label="Visible en la landing pública" />
      <span className="text-xs font-medium text-zinc-500">
        {visible ? "Visible en la landing" : "Oculto de la landing"}
      </span>
    </div>
  );
}
