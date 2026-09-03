import type { Listing } from "../lib/types";

/**
 * The full marketplace inventory. Hand-authored, typed, and frozen — the
 * single source of truth for every page.
 */
export const LISTINGS: readonly Listing[] = [
  {
    id: "SX-01", slug: "h100-sxm-forgegrid-newark",
    name: "H100 SXM8 Board · ForgeGrid Newark", vendor: "ForgeGrid",
    region: "us-east", city: "Newark", chip: "H100 SXM",
    memoryGb: 80, tflops: 989, priceCentsPerHour: 425,
    status: "available", units: 8, powerLimitWatts: 700,
    interconnect: "NVLink 900 GB/s", uptimeBps: 9_995,
  },
  {
    id: "SX-02", slug: "h100-nvl-vantiq-ashburn",
    name: "H100 NVL Pair · Vantiq Ashburn", vendor: "Vantiq Grid",
    region: "us-east", city: "Ashburn", chip: "H100 NVL",
    memoryGb: 188, tflops: 1_674, priceCentsPerHour: 780,
    status: "available", units: 4, powerLimitWatts: 800,
    interconnect: "NVLink 900 GB/s", uptimeBps: 9_991,
  },
  {
    id: "SX-03", slug: "a100-80-forgegrid-queens",
    name: "A100 80GB Rail · ForgeGrid Queens", vendor: "ForgeGrid",
    region: "us-east", city: "Queens", chip: "A100 SXM",
    memoryGb: 80, tflops: 312, priceCentsPerHour: 185,
    status: "available", units: 8, powerLimitWatts: 400,
    interconnect: "NVLink 600 GB/s", uptimeBps: 9_982,
  },
  {
    id: "SX-04", slug: "rtx-5090-coldshift-portland",
    name: "RTX 5090 Bench · ColdShift Portland", vendor: "ColdShift Data",
    region: "us-west", city: "Portland", chip: "RTX 5090",
    memoryGb: 32, tflops: 419, priceCentsPerHour: 72,
    status: "available", units: 6, powerLimitWatts: 575,
    interconnect: "PCIe 5.0 x16", uptimeBps: 9_968,
  },
  {
    id: "SX-05", slug: "rtx-4090-nimbuspeak-sf",
    name: "RTX 4090 Wall · NimbusPeak SF", vendor: "NimbusPeak",
    region: "us-west", city: "San Francisco", chip: "RTX 4090",
    memoryGb: 24, tflops: 330, priceCentsPerHour: 58,
    status: "available", units: 10, powerLimitWatts: 450,
    interconnect: "PCIe 4.0 x16", uptimeBps: 9_950,
  },
  {
    id: "SX-06", slug: "m3-ultra-512-orbital-austin",
    name: "M3 Ultra 512 · Orbital Austin", vendor: "Orbital Silicon",
    region: "us-central", city: "Austin", chip: "M3 Ultra",
    memoryGb: 512, tflops: 268, priceCentsPerHour: 490,
    status: "available", units: 2, powerLimitWatts: 250,
    interconnect: "Unified Memory 819 GB/s", uptimeBps: 9_999,
  },
  {
    id: "SX-07", slug: "mi300x-helio-frankfurt",
    name: "MI300X Octal · Helio Frankfurt", vendor: "Helio Compute",
    region: "eu-central", city: "Frankfurt", chip: "MI300X",
    memoryGb: 192, tflops: 1_307, priceCentsPerHour: 265,
    status: "available", units: 8, powerLimitWatts: 750,
    interconnect: "Infinity Fabric 896 GB/s", uptimeBps: 9_977,
  },
  {
    id: "SX-08", slug: "mi325x-basalt-amsterdam",
    name: "MI325X Tray · Basalt Amsterdam", vendor: "Basalt Cloud",
    region: "eu-north", city: "Amsterdam", chip: "MI325X",
    memoryGb: 256, tflops: 1_300, priceCentsPerHour: 315,
    status: "available", units: 4, powerLimitWatts: 1_000,
    interconnect: "Infinity Fabric 896 GB/s", uptimeBps: 9_986,
  },
  {
    id: "SX-09", slug: "rtx-pro-6000-vantiq-dallas",
    name: "RTX Pro 6000 Rack · Vantiq Dallas", vendor: "Vantiq Grid",
    region: "us-central", city: "Dallas", chip: "RTX Pro 6000",
    memoryGb: 96, tflops: 503, priceCentsPerHour: 125,
    status: "available", units: 12, powerLimitWatts: 600,
    interconnect: "PCIe 5.0 x16", uptimeBps: 9_971,
  },
  {
    id: "SX-10", slug: "h100-pcie-coldshift-reykjavik",
    name: "H100 PCIe Bus · ColdShift Reykjavik", vendor: "ColdShift Data",
    region: "eu-north", city: "Reykjavik", chip: "H100 PCIe",
    memoryGb: 80, tflops: 756, priceCentsPerHour: 350,
    status: "maintenance", units: 4, powerLimitWatts: 350,
    interconnect: "PCIe 5.0 x16", uptimeBps: 9_902,
  },
  {
    id: "SX-11", slug: "h200-sxm-meridian-singapore",
    name: "H200 SXM8 · Meridian Singapore", vendor: "Meridian Rack",
    region: "ap-southeast", city: "Singapore", chip: "H200 SXM",
    memoryGb: 141, tflops: 989, priceCentsPerHour: 495,
    status: "available", units: 8, powerLimitWatts: 700,
    interconnect: "NVLink 900 GB/s", uptimeBps: 9_993,
  },
  {
    id: "SX-12", slug: "a100-40-kestrel-sydney",
    name: "A100 40GB Node · Kestrel Sydney", vendor: "Kestrel DC",
    region: "ap-southeast", city: "Sydney", chip: "A100 PCIe",
    memoryGb: 40, tflops: 195, priceCentsPerHour: 150,
    status: "available", units: 4, powerLimitWatts: 300,
    interconnect: "PCIe 4.0 x16", uptimeBps: 9_940,
  },
  {
    id: "SX-13", slug: "l40s-kestrel-saopaulo",
    name: "L40S Inference Row · Kestrel São Paulo", vendor: "Kestrel DC",
    region: "sa-east", city: "São Paulo", chip: "L40S",
    memoryGb: 48, tflops: 362, priceCentsPerHour: 95,
    status: "available", units: 8, powerLimitWatts: 350,
    interconnect: "PCIe 4.0 x16", uptimeBps: 9_960,
  },
  {
    id: "SX-14", slug: "v100-16-basalt-lisbon",
    name: "V100 Legacy Cage · Basalt Lisbon", vendor: "Basalt Cloud",
    region: "eu-central", city: "Lisbon", chip: "V100 SXM2",
    memoryGb: 16, tflops: 125, priceCentsPerHour: 40,
    status: "retired", units: 4, powerLimitWatts: 300,
    interconnect: "NVLink 300 GB/s", uptimeBps: 9_700,
  },
  {
    id: "SX-15", slug: "h100-sxm-meridian-johor",
    name: "H100 SXM8 Cold Aisle · Meridian Johor", vendor: "Meridian Rack",
    region: "ap-southeast", city: "Johor Bahru", chip: "H100 SXM",
    memoryGb: 80, tflops: 989, priceCentsPerHour: 410,
    status: "available", units: 6, powerLimitWatts: 700,
    interconnect: "NVLink 900 GB/s", uptimeBps: 9_988,
  },
  {
    id: "SX-16", slug: "mi250x-orbital-montreal",
    name: "MI250X Dagger · Orbital Montreal", vendor: "Orbital Silicon",
    region: "us-east", city: "Montreal", chip: "MI250X",
    memoryGb: 128, tflops: 477, priceCentsPerHour: 160,
    status: "available", units: 4, powerLimitWatts: 500,
    interconnect: "Infinity Fabric 450 GB/s", uptimeBps: 9_931,
  },
  {
    id: "SX-17", slug: "rtx-4090-anvil-berlin",
    name: "RTX 4090 Mine · Anvil Stack Berlin", vendor: "Anvil Stack",
    region: "eu-central", city: "Berlin", chip: "RTX 4090",
    memoryGb: 24, tflops: 330, priceCentsPerHour: 61,
    status: "available", units: 20, powerLimitWatts: 450,
    interconnect: "PCIe 4.0 x16", uptimeBps: 9_912,
  },
  {
    id: "SX-18", slug: "t4-kestrel-singapore",
    name: "T4 Micro Fleet · Kestrel Singapore", vendor: "Kestrel DC",
    region: "ap-southeast", city: "Singapore", chip: "T4",
    memoryGb: 16, tflops: 65, priceCentsPerHour: 22,
    status: "retired", units: 16, powerLimitWatts: 70,
    interconnect: "PCIe 3.0 x16", uptimeBps: 9_610,
  },
  {
    id: "SX-19", slug: "a6000-nimbuspeak-montreal",
    name: "RTX A6000 Bench · NimbusPeak Montreal", vendor: "NimbusPeak",
    region: "us-east", city: "Montreal", chip: "RTX A6000",
    memoryGb: 48, tflops: 194, priceCentsPerHour: 78,
    status: "available", units: 6, powerLimitWatts: 300,
    interconnect: "PCIe 4.0 x16", uptimeBps: 9_947,
  },
  {
    id: "SX-20", slug: "b200-forgegrid-santaclara",
    name: "B200 Liquid Loop · ForgeGrid Santa Clara", vendor: "ForgeGrid",
    region: "us-west", city: "Santa Clara", chip: "B200",
    memoryGb: 192, tflops: 2_250, priceCentsPerHour: 890,
    status: "available", units: 4, powerLimitWatts: 1_000,
    interconnect: "NVLink 1.8 TB/s", uptimeBps: 9_998,
  },
  {
    id: "SX-21", slug: "rtx-5090-basalt-saopaulo",
    name: "RTX 5090 Hydro · Basalt São Paulo", vendor: "Basalt Cloud",
    region: "sa-east", city: "São Paulo", chip: "RTX 5090",
    memoryGb: 32, tflops: 419, priceCentsPerHour: 69,
    status: "available", units: 4, powerLimitWatts: 575,
    interconnect: "PCIe 5.0 x16", uptimeBps: 9_939,
  },
  {
    id: "SX-22", slug: "mi300x-nimbuspeak-chicago",
    name: "MI300X Quad · NimbusPeak Chicago", vendor: "NimbusPeak",
    region: "us-central", city: "Chicago", chip: "MI300X",
    memoryGb: 192, tflops: 1_307, priceCentsPerHour: 249,
    status: "available", units: 8, powerLimitWatts: 750,
    interconnect: "Infinity Fabric 896 GB/s", uptimeBps: 9_979,
  },
  {
    id: "SX-23", slug: "a100-80-kestrel-jakarta",
    name: "A100 80GB Rail · Kestrel Jakarta", vendor: "Kestrel DC",
    region: "ap-southeast", city: "Jakarta", chip: "A100 SXM",
    memoryGb: 80, tflops: 312, priceCentsPerHour: 180,
    status: "maintenance", units: 2, powerLimitWatts: 400,
    interconnect: "NVLink 600 GB/s", uptimeBps: 9_875,
  },
  {
    id: "SX-24", slug: "m3-ultra-192-anvil-tokyo",
    name: "M3 Ultra 192 · Anvil Stack Tokyo", vendor: "Anvil Stack",
    region: "ap-northeast", city: "Tokyo", chip: "M3 Ultra",
    memoryGb: 192, tflops: 134, priceCentsPerHour: 320,
    status: "available", units: 2, powerLimitWatts: 220,
    interconnect: "Unified Memory 819 GB/s", uptimeBps: 9_997,
  },
] as const;

const BY_SLUG = new Map(LISTINGS.map((l) => [l.slug, l]));
const BY_ID = new Map(LISTINGS.map((l) => [l.id, l]));

export function getListingBySlug(slug: string): Listing | undefined {
  return BY_SLUG.get(slug);
}

export function getListingById(id: string): Listing | undefined {
  return BY_ID.get(id);
}
