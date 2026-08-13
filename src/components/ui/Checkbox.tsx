import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  labelClassName?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, labelClassName, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  return (
    <label htmlFor={checkboxId} className={cn("flex items-center gap-2 text-zinc-600", labelClassName)}>
      <input
        id={checkboxId}
        ref={ref}
        type="checkbox"
        className={cn("rounded border-zinc-300 text-brand-600 focus:ring-brand-500", className)}
        {...props}
      />
      {label}
    </label>
  );
});
