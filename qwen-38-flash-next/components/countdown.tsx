"use client";

import { holdRemainingMs } from "@/lib/hold";
import { countdownLabel } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { cx } from "@/lib/cx";
import type { Reservation } from "@/lib/types";

/** Live MM:SS readout of a 10-minute hold, ticking off a real timer. */
export function HoldCountdown({
  reservation,
  className,
}: {
  reservation: Reservation;
  className?: string;
}) {
  const now = useNow(500);
  if (reservation.status !== "held") {
    return <span className={cx("text-faint", className)}>hold closed</span>;
  }
  if (now === 0) {
    return <span className={className}>10:00</span>;
  }
  const remaining = holdRemainingMs(reservation, now);
  if (remaining === 0) {
    return <span className={cx("text-bad", className)}>hold expired</span>;
  }
  return (
    <span
      className={cx(
        "tabular-nums",
        remaining < 60_000 && "text-bad",
        className,
      )}
      role="timer"
      aria-label={`Hold expires in ${countdownLabel(remaining)}`}
    >
      {countdownLabel(remaining)}
    </span>
  );
}
