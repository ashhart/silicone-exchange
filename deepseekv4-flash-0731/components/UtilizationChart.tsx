"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { UtilizationSample } from "@/data/types";
import { formatClock, formatDay } from "@/lib/time";

interface ChartDatum {
  ts: number;
  time: string;
  full: string;
  utilization: number;
  powerW: number;
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0]?.payload as ChartDatum | undefined;
  if (!datum) return null;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 font-mono text-xs shadow-lg">
      <p className="text-muted">{datum.full}</p>
      <p className="mt-1.5 flex justify-between gap-6">
        <span className="text-muted">Util</span>
        <span className="font-semibold text-accent">{datum.utilization.toFixed(1)}%</span>
      </p>
      <p className="flex justify-between gap-6">
        <span className="text-muted">Power</span>
        <span className="font-semibold text-ink">{datum.powerW} W</span>
      </p>
    </div>
  );
}

export function UtilizationChart({ samples }: { samples: UtilizationSample[] }) {
  const data: ChartDatum[] = samples.map((s) => ({
    ts: s.ts,
    time: formatClock(s.ts),
    full: `${formatDay(s.ts)} ${formatClock(s.ts)}`,
    utilization: s.utilization,
    powerW: s.powerW,
  }));

  const avg = data.reduce((sum, d) => sum + d.utilization, 0) / Math.max(1, data.length);
  const peak = Math.max(...data.map((d) => d.utilization));
  const avgPower = Math.round(
    data.reduce((sum, d) => sum + d.powerW, 0) / Math.max(1, data.length),
  );

  return (
    <div>
      <div className="h-56 w-full sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 0, left: -14, bottom: 0 }}>
            <CartesianGrid stroke="var(--sx-line)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={{ stroke: "var(--sx-line)" }}
              minTickGap={28}
            />
            <YAxis
              yAxisId="util"
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v: number) => `${v}%`}
            />
            <YAxis
              yAxisId="power"
              orientation="right"
              domain={[0, "dataMax + 60"]}
              tickLine={false}
              axisLine={false}
              width={42}
              tickFormatter={(v: number) => `${v}W`}
            />
            <Tooltip
              content={(props) => <ChartTooltip {...props} />}
              cursor={{ stroke: "var(--sx-line-strong)" }}
            />
            <Area
              yAxisId="power"
              type="monotone"
              dataKey="powerW"
              stroke="var(--sx-faint)"
              fill="var(--sx-faint)"
              fillOpacity={0.12}
              strokeWidth={1.2}
              dot={false}
              name="Power"
            />
            <Line
              yAxisId="util"
              type="monotone"
              dataKey="utilization"
              stroke="var(--sx-accent)"
              strokeWidth={1.8}
              dot={false}
              activeDot={{ r: 4 }}
              name="Utilization"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted">
        <span>
          24h avg <span className="text-ink">{avg.toFixed(1)}%</span>
        </span>
        <span>
          peak <span className="text-ink">{peak.toFixed(1)}%</span>
        </span>
        <span>
          avg power <span className="text-ink">{avgPower} W</span>
        </span>
      </div>
      <p className="sr-only">
        Utilization over the last 24 hours: average {avg.toFixed(1)} percent, peak{" "}
        {peak.toFixed(1)} percent, average power draw {avgPower} watts.
      </p>
    </div>
  );
}
