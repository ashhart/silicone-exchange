import type { Listing, ListingStatus } from "./types";
import { CHIP_BY_ID } from "./chips";
import { DAY_MS } from "@/lib/time";

type ListingSeed = readonly [
  slug: string,
  name: string,
  chipId: string,
  regionId: string,
  hourlyRateCents: number,
  status: ListingStatus,
  rack: string,
  hostname: string,
  note?: string,
];

const SEEDS: ListingSeed[] = [
  // US East — Ashburn, VA (IAD)
  ["h100-01-iad", "H100 SXM · IAD-01-03", "h100", "us-east-1", 18900, "available", "RACK-01", "iad-01-03.sx"],
  ["h200-02-iad", "H200 SXM · IAD-02-07", "h200", "us-east-1", 24900, "available", "RACK-02", "iad-02-07.sx"],
  ["a100-03-iad", "A100 80GB · IAD-03-11", "a100", "us-east-1", 8900, "maintenance", "RACK-03", "iad-03-11.sx", "Coolant loop service until Friday."],
  ["b200-04-iad", "B200 · IAD-04-01", "b200", "us-east-1", 39900, "available", "RACK-04", "iad-04-01.sx"],
  // US West — Boardman, OR (PDX)
  ["mi300x-01-pdx", "MI300X · PDX-01-05", "mi300x", "us-west-2", 21900, "available", "RACK-05", "pdx-01-05.sx"],
  ["h100-02-pdx", "H100 SXM · PDX-02-09", "h100", "us-west-2", 17900, "available", "RACK-06", "pdx-02-09.sx"],
  ["l40s-03-pdx", "L40S · PDX-03-02", "l40s", "us-west-2", 6900, "available", "RACK-07", "pdx-03-02.sx"],
  ["rtx5090-04-pdx", "RTX 5090 · PDX-04-14", "rtx5090", "us-west-2", 5900, "retired", "RACK-08", "pdx-04-14.sx", "Decommissioned — no longer offered."],
  // EU West — Dublin (DUB)
  ["h100-01-dub", "H100 SXM · DUB-01-04", "h100", "eu-west-1", 19900, "available", "RACK-09", "dub-01-04.sx"],
  ["mi325x-02-dub", "MI325X · DUB-02-08", "mi325x", "eu-west-1", 25900, "available", "RACK-10", "dub-02-08.sx"],
  ["rtxpro6000-03-dub", "RTX Pro 6000 · DUB-03-06", "rtxpro6000", "eu-west-1", 9900, "available", "RACK-11", "dub-03-06.sx"],
  ["m3ultra-04-dub", "M3 Ultra · DUB-04-12", "m3ultra", "eu-west-1", 4900, "available", "RACK-12", "dub-04-12.sx"],
  // EU Central — Frankfurt (FRA)
  ["h200-01-fra", "H200 SXM · FRA-01-02", "h200", "eu-central-1", 26900, "available", "RACK-13", "fra-01-02.sx"],
  ["a100-02-fra", "A100 80GB · FRA-02-10", "a100", "eu-central-1", 9400, "maintenance", "RACK-14", "fra-02-10.sx", "Firmware update in progress."],
  ["b200-03-fra", "B200 · FRA-03-05", "b200", "eu-central-1", 41900, "available", "RACK-15", "fra-03-05.sx"],
  ["h100-04-fra", "H100 SXM · FRA-04-13", "h100", "eu-central-1", 18900, "available", "RACK-16", "fra-04-13.sx"],
  // AP Southeast — Singapore (SIN)
  ["h100-01-sin", "H100 SXM · SIN-01-06", "h100", "ap-southeast-1", 20900, "available", "RACK-17", "sin-01-06.sx"],
  ["mi300x-02-sin", "MI300X · SIN-02-03", "mi300x", "ap-southeast-1", 22900, "available", "RACK-18", "sin-02-03.sx"],
  ["rtx5090-03-sin", "RTX 5090 · SIN-03-09", "rtx5090", "ap-southeast-1", 6400, "available", "RACK-19", "sin-03-09.sx"],
  ["l40s-04-sin", "L40S · SIN-04-15", "l40s", "ap-southeast-1", 7400, "retired", "RACK-20", "sin-04-15.sx", "Decommissioned — no longer offered."],
  // AP Northeast — Tokyo (NRT)
  ["h200-01-nrt", "H200 SXM · NRT-01-01", "h200", "ap-northeast-1", 27900, "available", "RACK-21", "nrt-01-01.sx"],
  ["h100-02-nrt", "H100 SXM · NRT-02-11", "h100", "ap-northeast-1", 19900, "available", "RACK-22", "nrt-02-11.sx"],
  ["b200-03-nrt", "B200 · NRT-03-07", "b200", "ap-northeast-1", 42900, "maintenance", "RACK-23", "nrt-03-07.sx", "Thermal sensor replacement."],
  ["m3ultra-04-nrt", "M3 Ultra · NRT-04-16", "m3ultra", "ap-northeast-1", 5200, "available", "RACK-24", "nrt-04-16.sx"],
];

const BASE_ADDED_MS = Date.UTC(2026, 0, 1);

export const LISTINGS: Listing[] = SEEDS.map((seed, i) => {
  const [slug, name, chipId, regionId, hourlyRateCents, status, rack, hostname, note] = seed;
  const chip = CHIP_BY_ID[chipId];
  if (!chip) throw new Error(`Unknown chip "${chipId}" in listing seed "${slug}"`);
  return {
    id: slug,
    slug,
    name,
    chipId,
    regionId,
    memoryGB: chip.memoryGB,
    tflops: chip.tflops,
    hourlyRateCents,
    status,
    rack,
    hostname,
    addedAtMs: BASE_ADDED_MS + i * 3 * DAY_MS,
    note,
  };
});

export const LISTING_BY_SLUG: Record<string, Listing> = Object.fromEntries(
  LISTINGS.map((l) => [l.slug, l]),
);

export const availableCount = LISTINGS.filter((l) => l.status === "available").length;

export const REGION_COUNT = new Set(LISTINGS.map((l) => l.regionId)).size;
