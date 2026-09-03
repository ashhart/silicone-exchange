import type { UtilizationSample } from "./types";
import { CHIP_BY_ID } from "./chips";
import { LISTINGS } from "./listings";
import { randFloat, seededRng } from "@/lib/rng";
import { DAY_MS, HOUR_MS, startOfDay } from "@/lib/time";

export const UTILIZATION_DAYS = 30;
export const SAMPLES_PER_DAY = 24;

const cache = new Map<string, UtilizationSample[]>();

/**
 * 30 days of hourly utilization + power samples per listing.
 * Seeded per listing id — identical on every reload, no Math.random().
 */
export function getUtilization(listingId: string): UtilizationSample[] {
  const cached = cache.get(listingId);
  if (cached) return cached;

  const listing = LISTINGS.find((l) => l.id === listingId);
  if (!listing) throw new Error(`Unknown listing "${listingId}"`);
  const chip = CHIP_BY_ID[listing.chipId]!;

  const rng = seededRng(`util:${listingId}`);
  const base = randFloat(rng, 18, 62);
  const amplitude = randFloat(rng, 8, 26);
  const spikeProb = randFloat(rng, 0.02, 0.07);
  const idlePower = Math.round(chip.powerW * 0.18);

  const samples: UtilizationSample[] = [];
  const startMs = startOfDay(Date.now() - (UTILIZATION_DAYS - 1) * DAY_MS).getTime();

  for (let i = 0; i < UTILIZATION_DAYS * SAMPLES_PER_DAY; i++) {
    const ts = startMs + i * HOUR_MS;
    const hour = new Date(ts).getHours();
    // Diurnal curve: peak mid-afternoon, trough pre-dawn.
    const diurnal = Math.sin(((hour - 8) / 24) * Math.PI * 2);
    let util = base + amplitude * diurnal + randFloat(rng, -6, 6);
    if (rng() < spikeProb) util = randFloat(rng, 88, 100); // training burst
    util = Math.min(100, Math.max(0, util));
    const utilization = Math.round(util * 10) / 10;
    const powerW = Math.round(
      idlePower + (chip.powerW - idlePower) * (utilization / 100) * randFloat(rng, 0.92, 1.05),
    );
    samples.push({ ts, utilization, powerW });
  }

  cache.set(listingId, samples);
  return samples;
}
