export function BrandPageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
}) {
  return (
    <div className="mb-14 flex flex-col items-center text-center">
      <p className="mb-4 text-xs font-semibold tracking-[0.32em] text-white/55 uppercase sm:text-sm">{eyebrow}</p>
      <h1 className="text-5xl leading-[0.95] font-bold tracking-[0.08em] text-white uppercase sm:text-6xl lg:text-7xl">
        {title}
      </h1>
      <div className="mt-6 h-px w-16 bg-gold-500 shadow-[0_0_18px_rgba(186,27,93,0.5)]" />
      <p className="mx-auto mt-6 max-w-2xl text-xs leading-relaxed tracking-[0.12em] text-white/55 uppercase sm:text-sm">
        {description}
      </p>
    </div>
  );
}
