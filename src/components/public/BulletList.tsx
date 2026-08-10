export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="relative rounded-xl border border-white/7 bg-white/6 py-3 pr-3.5 pl-7 text-[11.5px] leading-snug tracking-[0.02em] text-white/88 transition-colors hover:border-white/12 hover:bg-white/9 sm:text-sm"
        >
          <span className="absolute top-[19px] left-3 h-[5px] w-[5px] rounded-full bg-glam-500 shadow-[0_0_8px_rgba(233,0,110,0.6)]" />
          {item}
        </li>
      ))}
    </ul>
  );
}
