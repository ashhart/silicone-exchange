"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Listing, Reservation } from "@/data/types";
import { rangesOverlap } from "@/lib/overlap";
import { useNow } from "@/lib/useNow";
import {
  DAY_MS,
  HOUR_MS,
  floorToHour,
  formatClock,
  formatDay,
  formatWeekday,
  startOfDay,
} from "@/lib/time";

export interface TimeRange {
  startMs: number;
  endMs: number;
}

interface AvailabilityCalendarProps {
  listing: Listing;
  reservations: Reservation[];
  selection: TimeRange | null;
  onSelect: (range: TimeRange) => void;
  disabled?: boolean;
}

const HOUR_LABELS = [0, 4, 8, 12, 16, 20];

export function AvailabilityCalendar({
  listing,
  reservations,
  selection,
  onSelect,
  disabled = false,
}: AvailabilityCalendarProps) {
  const now = useNow(30_000);
  const nowFloor = floorToHour(now);
  const todayStart = startOfDay(now).getTime();
  const dragAnchorRef = useRef<number | null>(null);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, d) => todayStart + d * DAY_MS),
    [todayStart],
  );

  useEffect(() => {
    const stop = () => {
      dragAnchorRef.current = null;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  const slotTaken = (slotStart: number) =>
    reservations.some((r) => rangesOverlap(slotStart, slotStart + HOUR_MS, r.startMs, r.endMs));

  const slotSelected = (slotStart: number) =>
    selection !== null && slotStart >= selection.startMs && slotStart + HOUR_MS <= selection.endMs;

  const extendFrom = (anchor: number, slotStart: number) => {
    const a = Math.max(Math.min(anchor, slotStart), nowFloor);
    const b = Math.max(anchor, slotStart) + HOUR_MS;
    onSelect({ startMs: a, endMs: b });
  };

  const handleCellClick = (slotStart: number) => {
    if (slotStart < nowFloor || slotTaken(slotStart)) return;
    if (selection) {
      extendFrom(selection.startMs, slotStart);
    } else {
      onSelect({ startMs: slotStart, endMs: slotStart + HOUR_MS });
    }
  };

  const handleCellPointerDown = (slotStart: number) => {
    if (slotStart < nowFloor || slotTaken(slotStart)) return;
    dragAnchorRef.current = slotStart;
    onSelect({ startMs: slotStart, endMs: slotStart + HOUR_MS });
  };

  const handleCellPointerEnter = (slotStart: number) => {
    const anchor = dragAnchorRef.current;
    if (anchor === null) return;
    extendFrom(anchor, slotStart);
  };

  if (disabled) {
    return (
      <div className="rounded-xl border border-dashed border-line2 bg-surface px-4 py-8 text-center text-sm text-muted">
        {listing.status === "maintenance"
          ? "This node is in maintenance — new reservations are blocked. Existing bookings are unaffected."
          : "This node is retired and no longer accepts reservations."}
      </div>
    );
  }

  return (
    <div>
      <div
        className="sx-scroll-thin min-w-0 overflow-x-auto"
        role="grid"
        aria-label={`7-day availability for ${listing.name}`}
      >
        <div
          className="grid min-w-[560px] gap-px"
          style={{ gridTemplateColumns: "2.25rem repeat(7, 1fr)" }}
        >
          <div aria-hidden="true" />
          {days.map((day) => (
            <div
              key={day}
              className="pb-1 text-center font-mono text-[11px] leading-tight"
              aria-hidden="true"
            >
              <div className="font-semibold text-ink">{formatWeekday(day)}</div>
              <div className="text-faint">{formatDay(day)}</div>
            </div>
          ))}

          {Array.from({ length: 24 }, (_, h) => {
            const hourLabel = HOUR_LABELS.includes(h) ? formatClock(todayStart + h * HOUR_MS) : "";
            return (
              <div key={h} className="contents">
                <div className="flex items-center justify-end pr-1.5 font-mono text-[10px] text-faint">
                  {hourLabel}
                </div>
                {days.map((day) => {
                  const slotStart = day + h * HOUR_MS;
                  const past = slotStart < nowFloor;
                  const taken = slotTaken(slotStart);
                  const selected = slotSelected(slotStart);
                  const currentHour = slotStart === nowFloor;

                  let cls = "bg-surface2 hover:bg-accent/15";
                  if (past) cls = "bg-base opacity-40";
                  else if (taken) cls = "bg-danger/20";
                  else if (selected) cls = "bg-accent/25";

                  return (
                    <button
                      key={slotStart}
                      type="button"
                      aria-label={`${formatWeekday(day)} ${formatDay(day)} ${formatClock(slotStart)} — ${
                        past ? "in the past" : taken ? "taken" : selected ? "selected" : "available"
                      }`}
                      aria-pressed={selected}
                      aria-disabled={past || taken}
                      onClick={() => handleCellClick(slotStart)}
                      onPointerDown={() => handleCellPointerDown(slotStart)}
                      onPointerEnter={() => handleCellPointerEnter(slotStart)}
                      className={`relative h-5 min-w-0 rounded-[3px] border transition-colors ${cls} ${
                        currentHour ? "border-accent/60" : "border-transparent"
                      } ${past || taken ? "cursor-not-allowed" : "cursor-pointer"}`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-surface2" aria-hidden="true" /> available
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-accent/25" aria-hidden="true" /> selected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-danger/20" aria-hidden="true" /> taken
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px] bg-base opacity-40" aria-hidden="true" /> past
        </span>
      </div>
      <p className="mt-2 text-xs text-muted">
        Drag across hours to select a range, or tap two cells. Held and confirmed bookings block
        their slot.
      </p>
    </div>
  );
}
