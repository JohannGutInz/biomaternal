import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "bg-zinc-950 text-white hover:bg-brand-600 focus-visible:outline-brand-500",
  secondary: "bg-white text-zinc-700 ring-1 ring-inset ring-zinc-200 hover:bg-zinc-50",
  ghost: "text-zinc-600 hover:bg-zinc-100",
};

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ children, variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(base, variantClasses[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  href: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(base, variantClasses[variant], className)}>
      {children}
    </Link>
  );
}
