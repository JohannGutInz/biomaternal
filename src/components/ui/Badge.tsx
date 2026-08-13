import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "gold" | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-zinc-100 text-zinc-600 ring-zinc-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-rose-50 text-rose-700 ring-rose-200",
  gold: "bg-brand-50 text-brand-700 ring-brand-200",
  info: "bg-sky-50 text-sky-700 ring-sky-200",
};

const STATUS_TONE: Record<string, BadgeTone> = {
  activo: "success",
  aprobado: "success",
  confirmado: "success",
  completado: "success",
  finalizado: "success",
  disponible: "success",
  APPROVED: "success",
  pendiente: "warning",
  requiere_cambios: "warning",
  ocupado: "warning",
  PENDING: "warning",
  REQUIRES_CHANGES: "warning",
  enviado: "gold",
  planeado: "info",
  borrador: "neutral",
  inactivo: "neutral",
  no_disponible: "neutral",
  rechazado: "danger",
  cancelado: "danger",
  REJECTED: "danger",
};

export function statusTone(status: string): BadgeTone {
  return STATUS_TONE[status] ?? "neutral";
}

const STATUS_LABEL: Record<string, string> = {
  requiere_cambios: "Requiere cambios",
  no_disponible: "No disponible",
  PENDING: "Pendiente",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado",
  REQUIRES_CHANGES: "Requiere cambios",
};

export function statusLabel(status: string): string {
  return (
    STATUS_LABEL[status] ??
    status.replace(/_/g, " ").replace(/^\p{L}/u, (c) => c.toUpperCase())
  );
}

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge tone={statusTone(status)} className={className}>
      {statusLabel(status)}
    </Badge>
  );
}
