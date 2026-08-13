"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { statusLabel } from "@/components/ui/Badge";

const STATUS_COLOR: Record<string, string> = {
  pendiente: "#c94d81",
  confirmado: "#3f3f46",
  completado: "#059669",
  cancelado: "#fb7185",
  aprobado: "#059669",
  pagado: "#059669",
  enviado: "#c94d81",
  borrador: "#a1a1aa",
  rechazado: "#fb7185",
};

export function StatusDonutChart({ data }: { data: { status: string; total: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.total, 0);

  if (total === 0) {
    return (
      <div className="flex h-[260px] flex-col items-center justify-center text-sm text-zinc-400">
        Sin registros aún
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="status"
            innerRadius={64}
            outerRadius={92}
            paddingAngle={data.length > 1 ? 3 : 0}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLOR[entry.status] ?? "#a1a1aa"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, item) => [String(value), statusLabel(item.payload.status)]}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e4e4e7",
              fontSize: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 flex flex-wrap justify-center gap-x-5 gap-y-1.5">
        {data.map((entry) => (
          <li key={entry.status} className="flex items-center gap-1.5 text-xs text-zinc-600">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_COLOR[entry.status] ?? "#a1a1aa" }}
            />
            {statusLabel(entry.status)}
          </li>
        ))}
      </ul>
    </div>
  );
}
