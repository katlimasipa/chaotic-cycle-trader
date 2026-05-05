import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  data: { t: number; pnl: number }[];
}

export function EquityCurve({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.62 0.22 275)" stopOpacity={0.7} />
              <stop offset="100%" stopColor="oklch(0.62 0.22 275)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="t"
            tickFormatter={(v) => new Date(v).toLocaleTimeString().slice(0, 5)}
            stroke="oklch(0.6 0.03 270)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="oklch(0.6 0.03 270)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            width={48}
          />
          <Tooltip
            contentStyle={{
              background: "oklch(0.18 0.05 278)",
              border: "1px solid oklch(0.32 0.06 275)",
              borderRadius: 8,
              fontFamily: "DM Sans",
            }}
            labelFormatter={(v) => new Date(v as number).toLocaleTimeString()}
            formatter={(v: number) => [`$${v.toFixed(2)}`, "PnL"]}
          />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke="oklch(0.78 0.18 275)"
            strokeWidth={2}
            fill="url(#pnlGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
