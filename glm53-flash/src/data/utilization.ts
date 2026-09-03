import type { Listing } from "@/lib/types";
import { HOUR_MS } from "@/lib/time";
import { hashString, mulberry32 } from "@/lib/rng";

/**
 * 30 days of hourly utilization per listing, generated deterministically.
 *
 * The window rolls with the current hour, but every absolute hour's sample
 * is a pure function of (listing id, absolute hour index) — so the same
 * hour always renders identically on every reload, and no Math.random()
 * ever runs at render time.
 */

export const UTILIZATION_DAYS = 30;
export const UTILIZATION_HOURS = UTILIZATION_DAYS * 24;

export type UtilizationSample = {
  /** Absolute hour anchor (ms). */
  hourMs: number;
  /** 0–100. */
  utilizationPct: number;
  /** Board power draw in watts for that hour. */
  powerWatts: number;
};

type LoadShape = {
  baseLoad: number;
  dailyAmp: number;
  phase: number;
  burstEvery: number;
  burstLen: number;
  burstBoost: number;
  noiseScale: number;
  idleWatts: number;
  powerCurve: number;
};

function loadShape(listing: Listing): LoadShape {
  const rand = mulberry32(hashString(`shape:${listing.id}`));
  const retired = listing.status === "retired";
  const maintenance = listing.status === "maintenance";
  return {
    baseLoad: retired ? 0.02 : maintenance ? 0.05 : 0.25 + rand() * 0.4,
    dailyAmp: retired ? 0.01 : 0.08 + rand() * 0.22,
    phase: rand() * 24,
    burstEvery: 5 + Math.floor(rand() * 9),
    burstLen: 2 + Math.floor(rand() * 4),
    burstBoost: retired ? 0 : 0.18 + rand() * 0.3,
    noiseScale: 0.03 + rand() * 0.07,
    idleWatts: Math.round(listing.maxPowerWatts * (0.03 + rand() * 0.05)),
    powerCurve: 1.2 + rand() * 0.4,
  };
}

function sampleFor(listing: Listing, shape: LoadShape, absHour: number): UtilizationSample {
  const hourRand = mulberry32(hashString(`${listing.id}:${absHour}`));
  const hourOfDay = ((absHour % 24) + 24) % 24;

  const daily = shape.dailyAmp * Math.sin((2 * Math.PI * (hourOfDay - shape.phase)) / 24);
  const bursting = Math.abs(absHour) % shape.burstEvery < shape.burstLen;
  const burst = bursting ? shape.burstBoost * (0.6 + 0.4 * hourRand()) : 0;
  const noise = (hourRand() - 0.5) * 2 * shape.noiseScale;

  const raw = shape.baseLoad + daily + burst + noise;
  const utilizationPct = Math.min(99, Math.max(1, Math.round(raw * 100)));

  const load = utilizationPct / 100;
  const powerNoise = (hourRand() - 0.5) * listing.maxPowerWatts * 0.02;
  const powerWatts = Math.min(
    listing.maxPowerWatts,
    Math.max(shape.idleWatts, Math.round(shape.idleWatts + (listing.maxPowerWatts - shape.idleWatts) * Math.pow(load, shape.powerCurve) + powerNoise)),
  );

  return { hourMs: absHour * HOUR_MS, utilizationPct, powerWatts };
}

/** The full 30-day window, oldest first, ending at the hour containing nowMs. */
export function utilizationSeries(listing: Listing, nowMs: number): UtilizationSample[] {
  const shape = loadShape(listing);
  const currentHour = Math.floor(nowMs / HOUR_MS);
  const firstHour = currentHour - (UTILIZATION_HOURS - 1);
  const series: UtilizationSample[] = new Array(UTILIZATION_HOURS);
  for (let i = 0; i < UTILIZATION_HOURS; i++) {
    series[i] = sampleFor(listing, shape, firstHour + i);
  }
  return series;
}

/** The trailing 24 hours, oldest first — the detail-page chart window. */
export function last24hSeries(listing: Listing, nowMs: number): UtilizationSample[] {
  return utilizationSeries(listing, nowMs).slice(-24);
}

/** Mean utilization over the 30-day window, one decimal, used for sort + display. */
export function averageUtilization(listing: Listing, nowMs: number): number {
  const series = utilizationSeries(listing, nowMs);
  const sum = series.reduce((acc, s) => acc + s.utilizationPct, 0);
  return Math.round((sum / series.length) * 10) / 10;
}

/** Utilization map for every listing, keyed by id (for the browse sort). */
export function utilizationMap(listings: Listing[], nowMs: number): Map<string, number> {
  const map = new Map<string, number>();
  for (const listing of listings) {
    map.set(listing.id, averageUtilization(listing, nowMs));
  }
  return map;
}
