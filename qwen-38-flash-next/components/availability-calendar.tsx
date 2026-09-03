"use client";

import { useMemo } from "react";
import { useReservationStore } from "@/store/reservations";
import { blocksSlot, rangesOverlap } from "@/lib/overlap";
import { DAY_MS, HOUR_MS, startOfUtcDay } from "@/lib/time";
import { useHydrated, useNow } from "@/lib/hooks";
import { utcDateLabel } from "@/lib/format";
import { cx } from "@/lib/cx";

const DAYS = 7;

interface CellInfo {
  dayIdx: number;
  hour: number;
  ts: number;
  blocked: boolean;
  by: string | null;
  past: boolean;
}

/**
 * 7-day availability calendar. Hour slots covered by a live held or
 * confirmed reservation are visually blocked out; cancelled and expired
 * holds stay open.
 */
export function AvailabilityCalendar({ listingId }: { listingId: string }) {
  const hydrated = useHydrated();
  const now = useNow(15_000);
  const reservations = useReservationStore((s) => s.reservations);

  const { grid, blockedCount } = useMemo(() => {
    if (!hydrated || now === 0) {
      return { grid: [] as CellInfo[][], blockedCount: 0 };
    }
    const day0 = startOfUtcDay(now);
    const rows: CellInfo[][] = [];
    let blocked = 0;
    const taken = reservations.filter(
      (r) => r.listingId === listingId && blocksSlot(r, now),
    );
    for (let d = 0; d < DAYS; d++) {
      const row: CellInfo[] = [];
      for (let h = 0; h < 24; h++) {
        const ts = day0 + d * DAY_MS + h * HOUR_MS;
        const hit = taken.find((r) =>
          rangesOverlap(ts, ts + HOUR_MS, r.start, r.end),
        );
        const isBlocked = hit !== undefined;
        if (isBlocked) blocked += 1;
        row.push({
          dayIdx: d,
          hour: h,
          ts,
          blocked: isBlocked,
          by: hit?.id ?? null,
          past: ts + HOUR_MS <= now,
        });
      }
      rows.push(row);
    }
    return { grid: rows, blockedCount: blocked };
  }, [hydrated, listingId, now, reservations]);

  const openCount = DAYS * 24 - blockedCount;

  if (!hydrated || grid.length === 0) {
    return (
      <section aria-labelledby="calendar-h">
        <h2 id="calendar-h" className="font-display text-lg font-semibold">
          Next 7 days
        </h2>
        <div className="mt-4 h-40 animate-pulse border border-hairline bg-panel" />
      </section>
    );
  }

  return (
    <section aria-labelledby="calendar-h">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="calendar-h" className="font-display text-lg font-semibold">
          Next 7 days
        </h2>
        <p className="text-[11px] text-faint">all times UTC</p>
      </div>

      <div className="mt-4 border border-hairline bg-panel p-3 sm:p-4">
        <div role="img" aria-label={`Availability calendar. ${openCount} of ${DAYS * 24} hour-slots open, ${blockedCount} booked.`}>
          {grid.map((row) => (
            <div key={row[0].ts} className="mb-1.5 flex items-center gap-2 last:mb-0">
              <span className="w-16 shrink-0 text-[10px] text-dim tabular-nums sm:w-20">
                {utcDateLabel(row[0].ts)}
              </span>
              <div className="grid flex-1 grid-cols-[repeat(24,minmax(0,1fr))] gap-px">
                {row.map((c) => (
                  <div
                    key={c.ts}
                    title={`${utcDateLabel(c.ts)} ${String(c.hour).padStart(2, "0")}:00 UTC — ${
                      c.blocked ? `booked (${c.by})` : c.past ? "past" : "open"
                    }`}
                    className={cx(
                      "h-3.5 sm:h-4",
                      c.blocked
                        ? "bg-warn"
                        : c.past
                          ? "bg-hairline"
                          : "bg-good/25 hover:bg-good/45",
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-4 border-t border-hairline pt-3 text-[10px] tracking-widest text-dim uppercase">
          <Legend swatch="bg-good/25">open</Legend>
          <Legend swatch="bg-warn">booked</Legend>
          <Legend swatch="bg-hairline">past</Legend>
        </div>
        <p className="sr-only">
          Of {DAYS * 24} hour-slots across the next seven days, {openCount} are
          open and {blockedCount} are blocked by confirmed or actively held
          reservations on this listing.
        </p>
      </div>
    </section>
  );
}

function Legend({ swatch, children }: { swatch: string; children: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={cx("h-2.5 w-2.5", swatch)} />
      {children}
    </span>
  );
}
