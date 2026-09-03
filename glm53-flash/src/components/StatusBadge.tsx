import type { ListingStatus, ReservationStatus } from "@/lib/types";

const LISTING_LABEL: Record<ListingStatus, string> = {
  available: "Available",
  maintenance: "Maintenance",
  retired: "Retired",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-muted">
      <span className={`status-dot ${status}`} aria-hidden="true" />
      {LISTING_LABEL[status]}
    </span>
  );
}

const RES_LABEL: Record<ReservationStatus, string> = {
  held: "Held",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  expired: "Expired",
};

const RES_CLASS: Record<ReservationStatus, string> = {
  held: "border-warn/40 bg-warn/10 text-warn",
  confirmed: "border-ok/40 bg-ok/10 text-ok",
  cancelled: "border-line bg-surface-2 text-faint",
  expired: "border-line bg-surface-2 text-faint",
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] uppercase tracking-[0.08em] ${RES_CLASS[status]}`}>
      {RES_LABEL[status]}
    </span>
  );
}
