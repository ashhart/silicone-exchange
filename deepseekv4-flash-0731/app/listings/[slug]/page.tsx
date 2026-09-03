import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LISTING_BY_SLUG } from "@/data/listings";
import { CHIP_BY_ID } from "@/data/chips";
import { REGION_BY_ID } from "@/data/regions";
import { getUtilization } from "@/data/utilization";
import { formatMoney } from "@/lib/time";
import { ListingStatusBadge } from "@/components/StatusBadge";
import { UtilizationChart } from "@/components/UtilizationChart";
import { DetailReservationPanel } from "@/components/DetailReservationPanel";
import { CompareToggle } from "@/components/CompareToggle";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = LISTING_BY_SLUG[slug];
  if (!listing) return { title: "Node not found" };
  return {
    title: listing.name,
    description: `${listing.name} — ${listing.memoryGB} GB, ${listing.tflops.toLocaleString("en-US")} TFLOPS at ${formatMoney(listing.hourlyRateCents)}/hr.`,
  };
}

export default async function ListingPage({ params }: PageProps) {
  const { slug } = await params;
  const listing = LISTING_BY_SLUG[slug];
  if (!listing) notFound();

  const chip = CHIP_BY_ID[listing.chipId]!;
  const region = REGION_BY_ID[listing.regionId];
  const samples = getUtilization(listing.id).slice(-24);

  const specs: { label: string; value: string }[] = [
    { label: "Accelerator", value: `${chip.name} (${chip.vendor})` },
    { label: "VRAM", value: `${listing.memoryGB} GB ${chip.vramType}` },
    { label: "Compute", value: `${listing.tflops.toLocaleString("en-US")} TFLOPS` },
    { label: "Power", value: `${chip.powerW} W TDP` },
    { label: "Interconnect", value: chip.interconnect },
    { label: "Region", value: `${region?.label} · ${region?.city}` },
    { label: "Rack / host", value: `${listing.rack} · ${listing.hostname}` },
    { label: "Rate", value: `${formatMoney(listing.hourlyRateCents)}/hr` },
    { label: "Node ID", value: listing.slug },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/browse"
          className="font-mono text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          ← Browse
        </Link>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-faint">
            {region?.code} · {listing.rack}
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{listing.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <ListingStatusBadge status={listing.status} />
            <span className="font-mono text-sm text-muted">{listing.hostname}</span>
          </div>
        </div>
        <CompareToggle listingId={listing.id} />
      </div>

      {listing.note && (
        <p className="mt-4 max-w-2xl rounded-md border border-warn/30 bg-warn/5 px-3 py-2 text-sm text-muted">
          {listing.note}
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="min-w-0 space-y-6 lg:col-span-3">
          <section aria-labelledby="spec-heading" className="rounded-xl border border-line bg-surface p-5">
            <h2 id="spec-heading" className="font-display text-sm font-semibold">
              Spec sheet
            </h2>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              {specs.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-4 border-b border-line pb-2 font-mono text-xs">
                  <dt className="text-muted">{spec.label}</dt>
                  <dd className="text-right text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="util-heading" className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <h2 id="util-heading" className="font-display text-sm font-semibold">
                Utilization · last 24h
              </h2>
              <span className="font-mono text-[11px] text-faint">hourly samples</span>
            </div>
            <div className="mt-4">
              <UtilizationChart samples={samples} />
            </div>
          </section>
        </div>

        <section
          aria-labelledby="reserve-heading"
          className="min-w-0 lg:col-span-2"
        >
          <div className="rounded-xl border border-line bg-surface p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 id="reserve-heading" className="font-display text-sm font-semibold">
                Reserve
              </h2>
              <span className="font-mono text-xs text-muted">next 7 days</span>
            </div>
            <DetailReservationPanel listing={listing} />
          </div>
        </section>
      </div>
    </div>
  );
}
