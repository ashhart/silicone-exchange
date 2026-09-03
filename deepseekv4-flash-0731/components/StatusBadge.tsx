import type { ListingStatus, ReservationStatus } from "@/data/types";

const LISTING_STYLES: Record<ListingStatus, string> = {
  available: "border-ok/40 bg-ok/10 text-ok",
  maintenance: "border-warn/40 bg-warn/10 text-warn",
  retired: "border-line2 bg-surface2 text-muted",
};

const LISTING_DOT: Record<ListingStatus, string> = {
  available: "bg-ok",
  maintenance: "bg-warn",
  retired: "bg-muted",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${LISTING_STYLES[status]}`}
    >
      <span className={`h-1 w-1 rounded-full ${LISTING_DOT[status]}`} aria-hidden="true" />
      {status}
    </span>
  );
}

const RESERVATION_STYLES: Record<ReservationStatus, string> = {
  held: "border-warn/40 bg-warn/10 text-warn",
  confirmed: "border-ok/40 bg-ok/10 text-ok",
  cancelled: "border-line2 bg-surface2 text-muted",
  expired: "border-line2 bg-surface2 text-muted",
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${RESERVATION_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
