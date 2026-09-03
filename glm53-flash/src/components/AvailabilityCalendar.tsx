"use client";

import { useMemo } from "react";
import type { Reservation } from "@/lib/types";
import { HOUR_MS, addDays, formatDay, startOfDay } from "@/lib/time";
import { blocksSlot } from "@/lib/holds";

export type CalendarDay = {
  dayStart: number;
  /** 24 flags, one per hour of the day. */
  hours: Array<{ hour: number; blocked: boolean; past: boolean }>;
};

/**
 * 7-day availability grid. Each cell is one hour; blocked cells are hours
 * covered by a held-or-confirmed reservation (or already in the past).
 */
export function AvailabilityCalendar({
  listingId,
  reservations,
  nowMs,
}: {
  listingId: string;
  reservations: readonly Reservation[];
  nowMs: number;
}) {
  const days = useMemo<CalendarDay[]>(() => {
    const today = startOfDay(nowMs);
    const relevant = reservations.filter((r) => r.listingId === listingId);
    return Array.from({ length: 7 }, (_, dayOffset) => {
      const dayStart = addDays(today, dayOffset);
      const hours = Array.from({ length: 24 }, (_, hour) => {
        const hourStart = dayStart + hour * HOUR_MS;
        const hourEnd = hourStart + HOUR_MS;
        const blocked =
          hourStart < nowMs ||
          relevant.some(
            (r) =>
              blocksSlot(r, nowMs) &&
              r.startMs < hourEnd &&
              hourStart < r.endMs,
          );
        return { hour, blocked, past: hourStart < nowMs };
      });
      return { dayStart, hours };
    });
  }, [listingId, reservations, nowMs]);

  const blockedCount = days.reduce(
    (acc, day) => acc + day.hours.filter((h) => h.blocked && !h.past).length,
    0,
  );

  return (
    <div>
      <div
        className="grid grid-cols-7 gap-2"
        role="table"
        aria-label="7-day availability calendar, one column per day, each cell one hour"
      >
        {days.map((day) => (
          <div key={day.dayStart} role="row" className="flex flex-col items-center gap-1">
            <div className="text-[10px] uppercase tracking-[0.06em] text-faint" role="columnheader">
              {formatDay(day.dayStart).replace(",", "")}
            </div>
            <div className="grid w-full grid-rows-12 gap-px" role="cell">
              {day.hours.map((h) => (
                <div
                  key={h.hour}
                  title={
                    h.blocked
                      ? h.past
                        ? "Past"
                        : "Reserved"
                      : `Free · ${String(h.hour).padStart(2, "0")}:00`
                  }
                  className={`h-2.5 w-full rounded-[2px] ${
                    h.blocked ? (h.past ? "bg-surface-2" : "bg-line-strong") : "bg-accent/25"
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-faint">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-accent/25" /> free
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-line-strong" /> reserved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-surface-2" /> past
        </span>
        <span className="num ml-auto">
          {blockedCount}h reserved this week
        </span>
      </div>
    </div>
  );
}
