"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { UtilizationSample } from "@/data/utilization";
import { formatTime } from "@/lib/time";

export type ChartPoint = {
  hourMs: number;
  label: string;
  utilizationPct: number;
  powerWatts: number;
};

export function UtilizationChart({
  data,
  nowMs,
  accent,
}: {
  data: ChartPoint[];
  nowMs: number;
  accent: string;
}) {
  return (
    <div className="h-56 w-full sm:h-64" role="img" aria-label={chartSummary(data)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "var(--text-faint)", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--chart-grid)" }}
            interval={3}
            tickMargin={6}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "var(--text-faint)", fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}%`}
            width={44}
          />
          <Tooltip content={<UtilTooltip />} />
          <ReferenceLine x={nearestLabel(data, nowMs)} stroke="var(--border-strong)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="utilizationPct"
            stroke={accent}
            strokeWidth={1.8}
            dot={false}
            activeDot={{ r: 3, fill: accent }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function UtilTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="label num">{point.label}</div>
      <div className="num text-ink">{point.utilizationPct}% utilized</div>
      <div className="num text-muted">{point.powerWatts} W draw</div>
    </div>
  );
}

function nearestLabel(data: ChartPoint[], nowMs: number): string {
  if (data.length === 0) return "";
  let best = data[0];
  for (const point of data) {
    if (Math.abs(point.hourMs - nowMs) < Math.abs(best.hourMs - nowMs)) best = point;
  }
  return best.label;
}

/** Text alternative for the chart, per accessibility requirements. */
export function chartSummary(data: ChartPoint[]): string {
  if (data.length === 0) return "No utilization data.";
  const values = data.map((d) => d.utilizationPct);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const peak = data.reduce((a, b) => (b.utilizationPct > a.utilizationPct ? b : a));
  return `Hourly utilization for the last 24 hours. Averages ${avg} percent, ranging from ${min} to ${max} percent. Peak ${peak.utilizationPct} percent at ${formatTime(peak.hourMs)}.`;
}

export function toChartPoints(samples: UtilizationSample[]): ChartPoint[] {
  return samples.map((s) => ({
    hourMs: s.hourMs,
    label: formatTime(s.hourMs),
    utilizationPct: s.utilizationPct,
    powerWatts: s.powerWatts,
  }));
}
