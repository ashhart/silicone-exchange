"use client";

import { useEffect, useState } from "react";
import { HOLD_DURATION_MS } from "@/lib/holds";
import { formatDuration } from "@/lib/time";

/**
 * Live countdown for a hold. Renders the remaining time from a real
 * per-second timer; flips to "expired" the moment the deadline passes.
 */
export function HoldCountdown({ createdAtMs }: { createdAtMs: number }) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemainingMs(createdAtMs + HOLD_DURATION_MS - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [createdAtMs]);

  if (remainingMs === null) {
    // First client frame: render a stable placeholder so SSR markup matches.
    return <span className="num text-warn">--:--</span>;
  }

  if (remainingMs <= 0) {
    return <span className="num text-faint">expired</span>;
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const label = minutes >= 1 ? `${formatDuration(minutes)} ${String(seconds).padStart(2, "0")}s` : `${seconds}s`;

  return (
    <span className={`num ${remainingMs < 120_000 ? "text-danger" : "text-warn"}`} suppressHydrationWarning>
      {label}
    </span>
  );
}
