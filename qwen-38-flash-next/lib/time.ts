export const MINUTE_MS = 60_000;
export const HOUR_MS = 3_600_000;
export const DAY_MS = 86_400_000;

/** Epoch ms of the most recent hour boundary at or before `ts`. */
export function floorToHour(ts: number): number {
  return Math.floor(ts / HOUR_MS) * HOUR_MS;
}

/** Epoch ms of the next hour boundary strictly after `ts`. */
export function ceilToHour(ts: number): number {
  return Math.ceil(ts / HOUR_MS) * HOUR_MS;
}

/** Epoch ms of the most recent UTC midnight at or before `ts`. */
export function startOfUtcDay(ts: number): number {
  return Math.floor(ts / DAY_MS) * DAY_MS;
}

/** UTC hour-of-day (0-23) for an epoch-ms timestamp. */
export function utcHour(ts: number): number {
  return Math.floor(ts / HOUR_MS) % 24;
}

/** UTC day-of-week (0=Sun..6=Sat) for an epoch-ms timestamp. */
export function utcDayOfWeek(ts: number): number {
  return (Math.floor(ts / DAY_MS) % 7 + 7) % 7;
}
