export function BulletList({ items, twoCol = false }: { items: string[]; twoCol?: boolean }) {
  return (
    <ul className={twoCol ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "flex flex-col gap-2"}>
      {items.map((item) => (
        <li
          key={item}
          className="relative rounded-lg bg-white/5 py-3 pr-4 pl-7 text-sm leading-snug text-white/85 sm:text-base"
        >
          <span className="absolute top-1/2 left-3 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-gold-500 shadow-[0_0_8px_rgba(186,27,93,0.7)]" />
          {item}
        </li>
      ))}
    </ul>
  );
}
