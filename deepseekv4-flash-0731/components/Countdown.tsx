"use client";

import { useNow } from "@/lib/useNow";
import { formatCountdown } from "@/lib/time";

export function Countdown({ targetMs }: { targetMs: number }) {
  const now = useNow(1000);
  const remaining = Math.max(0, targetMs - now);
  const urgent = remaining < 60_000;
  return (
    <span className={`font-mono tabular-nums ${urgent ? "text-danger" : "text-warn"}`}>
      {formatCountdown(remaining)}
    </span>
  );
}
