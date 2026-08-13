export function OccupancyBars({ data }: { data: { sucursalId: string; sucursalName: string; occupancyPct: number }[] }) {
  if (data.length === 0) {
    return <div className="flex h-[120px] items-center justify-center text-sm text-zinc-400">Sin sucursales registradas</div>;
  }

  return (
    <ul className="space-y-4">
      {data.map((s) => (
        <li key={s.sucursalId}>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-700">{s.sucursalName}</span>
            <span className="text-zinc-500">{s.occupancyPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${s.occupancyPct}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
