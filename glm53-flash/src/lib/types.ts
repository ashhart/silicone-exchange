export type RegionCode =
  | "us-west-2"
  | "us-east-1"
  | "eu-central-1"
  | "ap-northeast-1"
  | "ap-south-1"
  | "sa-east-1";

export type Region = {
  code: RegionCode;
  label: string;
  site: string;
};

export type ListingStatus = "available" | "maintenance" | "retired";

export type Listing = {
  id: string;
  slug: string;
  chip: string;
  vendor: string;
  region: RegionCode;
  site: string;
  memoryGB: number;
  memoryType: string;
  bandwidthGBs: number;
  tflops: number;
  tflopsPrecision: string;
  interconnect: string;
  maxPowerWatts: number;
  /** Hourly rate in integer cents. Never a float. */
  hourlyRateCents: number;
  status: ListingStatus;
  description: string;
};

export type ReservationStatus = "held" | "confirmed" | "cancelled" | "expired";

export type Reservation = {
  id: string;
  listingId: string;
  /** Half-open range: [startMs, endMs). */
  startMs: number;
  endMs: number;
  status: ReservationStatus;
  createdAtMs: number;
  /** Absolute deadline while status is "held"; null otherwise. */
  holdExpiresAtMs: number | null;
  /** Locked-in price in integer cents, quoted at hold creation. */
  priceCents: number;
  hourlyRateCents: number;
};
