/** Formatting helpers. Money is rendered from integer cents, never floats. */

/** 123456n -> "$1,234.56" */
export function usd(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const whole = Math.trunc(abs / 100);
  const frac = String(abs % 100).padStart(2, "0");
  return `${sign}$${thousands(whole)}.${frac}`;
}

function thousands(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** Integer basis points -> "99.95%" */
export function percentOfBps(bps: number): string {
  const whole = Math.trunc(bps / 100);
  const frac = String(bps % 100).padStart(2, "0");
  return `${whole}.${frac}%`;
}

const UTC_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const UTC_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function parts(ts: number) {
  const d = new Date(ts);
  return {
    day: UTC_DAYS[d.getUTCDay()],
    month: UTC_MONTHS[d.getUTCMonth()],
    date: d.getUTCDate(),
    hh: pad2(d.getUTCHours()),
    mm: pad2(d.getUTCMinutes()),
  };
}

/** "Wed Sep 3 · 14:00 UTC" */
export function utcLabel(ts: number): string {
  const p = parts(ts);
  return `${p.day} ${p.month} ${p.date} · ${p.hh}:${p.mm} UTC`;
}

/** "Sep 3" */
export function utcDateLabel(ts: number): string {
  const p = parts(ts);
  return `${p.month} ${p.date}`;
}

/** "14:00" */
export function utcHourLabel(ts: number): string {
  const p = parts(ts);
  return `${p.hh}:00`;
}

/** Milliseconds -> "MM:SS" (for hold countdowns; hours fold into minutes). */
export function countdownLabel(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

/** Minutes -> "24h 15m" */
export function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
