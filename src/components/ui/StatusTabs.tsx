import Link from "next/link";
import { cn } from "@/lib/utils";

export interface StatusTab {
  value: string;
  label: string;
}

export function StatusTabs({
  basePath,
  tabs,
  active,
  counts,
}: {
  basePath: string;
  tabs: StatusTab[];
  active: string;
  counts: Record<string, number>;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-1.5 border-b border-zinc-200 pb-px">
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <Link
            key={tab.value}
            href={tab.value === "todas" ? basePath : `${basePath}?estado=${tab.value}`}
            className={cn(
              "relative -mb-px rounded-t-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
              isActive ? "border-b-2 border-brand-500 text-zinc-900" : "text-zinc-500 hover:text-zinc-800",
            )}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span
                className={cn(
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-[11px]",
                  isActive ? "bg-brand-100 text-brand-700" : "bg-zinc-100 text-zinc-500",
                )}
              >
                {counts[tab.value]}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
