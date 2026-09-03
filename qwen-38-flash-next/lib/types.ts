export const REGIONS = [
  "us-east",
  "us-central",
  "us-west",
  "eu-central",
  "eu-north",
  "ap-southeast",
  "ap-northeast",
  "sa-east",
] as const;

export type Region = (typeof REGIONS)[number];

export type ListingStatus = "available" | "maintenance" | "retired";

export interface Listing {
  /** Stable human-readable id, e.g. "SX-01". */
  id: string;
  slug: string;
  name: string;
  vendor: string;
  region: Region;
  city: string;
  chip: string;
  memoryGb: number;
  /** Dense FP16 tensor TFLOPS per unit. */
  tflops: number;
  /** Hourly rate per unit, integer cents. */
  priceCentsPerHour: number;
  status: ListingStatus;
  units: number;
  /** Max draw per unit at 100% load, watts. */
  powerLimitWatts: number;
  interconnect: string;
  /** Uptime in basis points, e.g. 9995 = 99.95%. */
  uptimeBps: number;
}

export type ReservationStatus = "held" | "confirmed" | "cancelled" | "expired";

export interface Reservation {
  id: string;
  listingId: string;
  /** Epoch ms, inclusive. */
  start: number;
  /** Epoch ms, exclusive. */
  end: number;
  status: ReservationStatus;
  priceCents: number;
  createdAt: number;
  /** Epoch ms the 10-minute hold clock started. */
  heldAt: number;
  confirmedAt?: number;
  cancelledAt?: number;
  expiredAt?: number;
}
