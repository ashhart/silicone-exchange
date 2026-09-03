export type ListingStatus = "available" | "maintenance" | "retired";
export type ReservationStatus = "held" | "confirmed" | "cancelled" | "expired";

export interface Chip {
  id: string;
  name: string;
  vendor: string;
  memoryGB: number;
  tflops: number;
  powerW: number;
  interconnect: string;
  vramType: string;
  year: number;
}

export interface Listing {
  id: string;
  slug: string;
  name: string;
  chipId: string;
  regionId: string;
  memoryGB: number;
  tflops: number;
  hourlyRateCents: number;
  status: ListingStatus;
  rack: string;
  hostname: string;
  addedAtMs: number;
  note?: string;
}

export interface UtilizationSample {
  ts: number;
  utilization: number; // 0-100
  powerW: number;
}

export interface Reservation {
  id: string;
  listingId: string;
  startMs: number;
  endMs: number;
  status: ReservationStatus;
  createdAtMs: number;
  confirmedAtMs?: number;
  heldUntilMs?: number;
}
