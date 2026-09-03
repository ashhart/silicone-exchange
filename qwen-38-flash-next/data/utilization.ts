import { mulberry32, hashSeed } from "../lib/prng";
import { HOUR_MS, utcDayOfWeek, utcHour } from "../lib/time";
import type { Listing } from "../lib/types";
import { LISTINGS, getListingById } from "./listings";

/**
 * 30 days of hourly utilization + power samples per listing. Generated from a
 * seeded PRNG against a fixed data anchor, so every reload — and every
 * render — produces identical numbers. No Math.random anywhere.
 */

/** Last sample point. Fixed so generated telemetry never shifts. */
export const DATA_END_UTC = Date.UTC(2026, 8, 3, 0, 0, 0, 0); // 2026-09-03T00:00Z

export const SAMPLE_HOURS = 30 * 24;

export interface UtilSample {
  /** Epoch ms of the sample hour. */
  t: number;
  /** GPU utilization, 0-100 (integer percent). */
  utilPct: number;
  /** Draw per unit, watts, clamped at the listing's power limit. */
  watts: number;
}

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

function generate(listing: Listing): UtilSample[] {
  const rng = mulberry32(hashSeed(`${listing.id}:util`));
  const idleFloor = 0.1 + rng() * 0.08; // machines rarely sit at true zero
  const duty = 0.4 + rng() * 0.42; // how busy this fleet typically runs
  const weekendDip = 0.5 + rng() * 0.25;
  const phase = rng() * Math.PI * 2; // per-facility daily peak offset
  const t0 = DATA_END_UTC - (SAMPLE_HOURS - 1) * HOUR_MS;
  const idleWatts = Math.round(listing.powerLimitWatts * 0.18);

  const samples: UtilSample[] = [];
  for (let i = 0; i < SAMPLE_HOURS; i++) {
    const t = t0 + i * HOUR_MS;
    const h = utcHour(t);
    const dow = utcDayOfWeek(t);
    // Business-hours swell peaking around 15:00 UTC, plus facility phase.
    const daily = 0.5 + 0.5 * Math.cos(((h - 15) / 24) * 2 * Math.PI + phase);
    const weekend = dow === 0 || dow === 6 ? weekendDip : 1;
    const spike = rng() < 0.04 ? 0.25 + rng() * 0.3 : 0;
    const noise = (rng() - 0.5) * 0.12;
    const util = clamp(
      Math.round((idleFloor + duty * daily * weekend + spike + noise) * 100),
      0,
      100,
    );
    const watts = clamp(
      Math.round(
        idleWatts +
          (listing.powerLimitWatts - idleWatts) * (0.15 + 0.85 * (util / 100)) +
          (rng() - 0.5) * 10,
      ),
      40,
      listing.powerLimitWatts,
    );
    samples.push({ t, utilPct: util, watts });
  }
  return samples;
}

const cache = new Map<string, UtilSample[]>();

/** Deterministic 720-sample telemetry series for one listing. */
export function samplesForListingId(listingId: string): UtilSample[] {
  let s = cache.get(listingId);
  if (!s) {
    const listing = getListingById(listingId);
    if (!listing) throw new Error(`unknown listing: ${listingId}`);
    s = generate(listing);
    cache.set(listingId, s);
  }
  return s;
}

/** The most recent 24 samples, oldest first. */
export function last24h(listingId: string): UtilSample[] {
  return samplesForListingId(listingId).slice(-24);
}

/** Mean utilization over the trailing 24 hours, integer percent. */
export function avgUtil24h(listingId: string): number {
  const win = last24h(listingId);
  let sum = 0;
  for (const s of win) sum += s.utilPct;
  return Math.round(sum / win.length);
}

/** Lookup keyed by listing id — used by browse sorting and cards. */
export function utilByListing(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of LISTINGS) out[l.id] = avgUtil24h(l.id);
  return out;
}
