"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { last24h, type UtilSample } from "@/data/utilization";
import { utcHourLabel, utcLabel } from "@/lib/format";
import { cx } from "@/lib/cx";

type Series = "utilPct" | "watts";

interface TipProps {
  active?: boolean;
  payload?: Array<{ payload: UtilSample }>;
}

function ChartTip({ active, payload }: TipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const s = payload[0].payload;
  return (
    <div className="border border-hairline bg-raised px-2.5 py-1.5 text-[11px] shadow-lg">
      <div className="text-faint tabular-nums">{utcLabel(s.t)}</div>
      <div className="mt-0.5 text-ink tabular-nums">
        {s.utilPct}% util · {s.watts} W
      </div>
    </div>
  );
}

/**
 * 24-hour utilization line chart with hover tooltip. Below it, a text
 * summary (required alternative for every chart) with the full table.
 */
export function UtilizationChart({
  listingId,
  powerLimitWatts,
}: {
  listingId: string;
  powerLimitWatts: number;
}) {
  const [series, setSeries] = useState<Series>("utilPct");
  const data = useMemo(
    () => last24h(listingId).map((s) => ({ ...s, label: utcHourLabel(s.t) })),
    [listingId],
  );

  const stats = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let peak = data[0];
    for (const s of data) {
      min = Math.min(min, s.utilPct);
      max = Math.max(max, s.utilPct);
      sum += s.utilPct;
      if (s.watts > peak.watts) peak = s;
    }
    return {
      min,
      max,
      avg: Math.round(sum / data.length),
      peakWatts: peak.watts,
      peakAt: peak.t,
    };
  }, [data]);

  const isUtil = series === "utilPct";

  return (
    <section aria-labelledby="telemetry-h">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="telemetry-h" className="font-display text-lg font-semibold">
          Trailing 24h telemetry
        </h2>
        <div role="group" aria-label="Chart series" className="flex gap-1">
          <SeriesButton active={isUtil} onClick={() => setSeries("utilPct")}>
            utilization %
          </SeriesButton>
          <SeriesButton active={!isUtil} onClick={() => setSeries("watts")}>
            watts
          </SeriesButton>
        </div>
      </div>

      <div className="mt-4 border border-hairline bg-panel p-3">
        <div aria-hidden="true" className="h-[260px] w-full sm:h-[288px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 6, left: -22, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "var(--faint)" }}
                interval={3}
                tickLine={false}
                axisLine={{ stroke: "var(--hairline)" }}
              />
              <YAxis
                domain={isUtil ? [0, 100] : [0, powerLimitWatts]}
                tick={{ fontSize: 10, fill: "var(--faint)" }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip content={<ChartTip />} />
              <Line
                type="monotone"
                dataKey={series}
                stroke="var(--accent)"
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 0, fill: "var(--accent)" }}
                animationDuration={650}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="sr-only">
          Line chart of {isUtil ? "hourly utilization" : "hourly power draw"} over the last 24
          hours. Average utilization {stats.avg}%, ranging {stats.min}% to{" "}
          {stats.max}%. Peak power draw {stats.peakWatts} watts at{" "}
          {utcLabel(stats.peakAt)}. See the table in the text summary for
          hourly values.
        </p>
      </div>

      <details className="mt-3 border border-hairline bg-panel px-4 py-3">
        <summary className="cursor-pointer text-xs tracking-widest text-dim uppercase">
          Text summary — 24h telemetry
        </summary>
        <p className="mt-3 text-xs leading-relaxed text-dim">
          Average utilization <span className="text-ink tabular-nums">{stats.avg}%</span>, band{" "}
          <span className="text-ink tabular-nums">{stats.min}%–{stats.max}%</span>. Peak draw{" "}
          <span className="text-ink tabular-nums">{stats.peakWatts} W</span> of{" "}
          {powerLimitWatts} W at {utcLabel(stats.peakAt)}.
        </p>
        <div className="mt-3 max-h-56 overflow-auto">
          <table className="w-full text-[11px] tabular-nums">
            <thead>
              <tr className="text-left text-faint">
                <th scope="col" className="py-1 pr-4 font-normal">Hour (UTC)</th>
                <th scope="col" className="py-1 pr-4 font-normal">Util %</th>
                <th scope="col" className="py-1 font-normal">Watts</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s) => (
                <tr key={s.t} className="border-t border-hairline text-dim">
                  <td className="py-1 pr-4 text-ink">{s.label}</td>
                  <td className="py-1 pr-4">{s.utilPct}</td>
                  <td className="py-1">{s.watts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}

function SeriesButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "border px-2 py-1 text-[10px] tracking-widest uppercase transition-colors",
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-hairline text-dim hover:border-accent/60 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
