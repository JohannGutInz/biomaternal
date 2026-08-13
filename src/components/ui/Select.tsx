import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  labelClassName?: string;
  error?: string;
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, labelClassName, error, placeholder, id, className, children, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <div>
      {label && (
        <label htmlFor={selectId} className={cn("mb-1.5 block text-sm font-medium text-zinc-700", labelClassName)}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={cn(
          "w-full rounded-lg border border-zinc-300 bg-white py-2.5 px-3 text-sm text-zinc-900 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400",
          error && "border-rose-300 focus:border-rose-500 focus:ring-rose-500",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
});
