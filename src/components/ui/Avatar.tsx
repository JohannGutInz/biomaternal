import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";

const sizeClasses = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 font-semibold text-brand-300 ring-1 ring-zinc-900/10",
        sizeClasses[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
