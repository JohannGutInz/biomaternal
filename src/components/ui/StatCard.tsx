import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";

const iconToneClasses: Record<string, string> = {
  zinc: "bg-zinc-100 text-zinc-700",
  gold: "bg-brand-100 text-brand-700",
  emerald: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700",
  sky: "bg-sky-100 text-sky-700",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "zinc",
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  tone?: keyof typeof iconToneClasses;
  trend?: { value: string; positive?: boolean };
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-zinc-500">{title}</span>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconToneClasses[tone])}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{value}</p>
      {subtitle ? <p className="mt-1 text-xs text-zinc-500">{subtitle}</p> : null}
      {trend ? (
        <p className={cn("mt-2 text-xs font-medium", trend.positive ? "text-emerald-600" : "text-zinc-400")}>
          {trend.positive ? "↗" : "→"} {trend.value}
        </p>
      ) : null}
    </Card>
  );
}
