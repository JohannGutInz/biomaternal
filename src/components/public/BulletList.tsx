import { ExternalLink } from "lucide-react";

export type BulletItem = string | { label: string; href: string };

export function BulletList({ items }: { items: BulletItem[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => {
        const isLink = typeof item !== "string";
        const key = isLink ? item.href : item;
        const label = isLink ? item.label : item;

        return (
          <li key={key} className="relative">
            <span className="absolute top-[19px] left-3 h-[5px] w-[5px] rounded-full bg-brand-500 shadow-[0_0_8px_rgba(23,172,227,0.6)]" />
            {isLink ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-xl border border-white/7 bg-white/6 py-3 pr-3.5 pl-7 text-[11.5px] leading-snug tracking-[0.02em] text-white/88 transition-colors hover:border-brand-500/30 hover:bg-white/9 hover:text-white sm:text-sm"
              >
                {label}
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/40" />
              </a>
            ) : (
              <div className="rounded-xl border border-white/7 bg-white/6 py-3 pr-3.5 pl-7 text-[11.5px] leading-snug tracking-[0.02em] text-white/88 transition-colors hover:border-white/12 hover:bg-white/9 sm:text-sm">
                {label}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
