import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LISTINGS, getListingBySlug } from "@/data/listings";
import { avgUtil24h } from "@/data/utilization";
import { percentOfBps, usd } from "@/lib/format";
import { ListingStatusBadge, SpecRow } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { UtilizationChart } from "@/components/utilization-chart";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { ReservationForm } from "@/components/reservation-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return LISTINGS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata(
  props: Props,
): Promise<Metadata> {
  const { slug } = await props.params;
  const listing = getListingBySlug(slug);
  if (!listing) return { title: "Listing not found" };
  return {
    title: `${listing.chip} · ${listing.city}`,
    description: `${listing.name} — ${listing.memoryGb} GB, ${listing.tflops} TFLOPS at ${usd(listing.priceCentsPerHour)}/GPU-hour.`,
  };
}

export default async function ListingPage(props: Props) {
  const { slug } = await props.params;
  const listing = getListingBySlug(slug);
  if (!listing) notFound();

  const related = LISTINGS.filter(
    (l) => l.region === listing.region && l.id !== listing.id,
  ).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-[11px] text-faint">
        <Link href="/browse" className="text-dim hover:text-accent">
          ← back to board
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Reveal>
          <header>
            <p className="text-[11px] text-faint tabular-nums">
              {listing.id} · {listing.vendor}
            </p>
            <h1 className="mt-2 font-display text-2xl leading-tight font-semibold tracking-tight md:text-3xl">
              {listing.name}
            </h1>
            <div className="mt-3">
              <ListingStatusBadge status={listing.status} />
            </div>
            <p className="mt-6 font-display text-4xl font-semibold text-accent tabular-nums">
              {usd(listing.priceCentsPerHour)}
              <span className="font-mono text-xs text-faint">/GPU-hour</span>
            </p>
          </header>

          <dl className="mt-8 border border-hairline bg-panel px-4 py-2">
            <SpecRow k="chip" v={listing.chip} />
            <SpecRow k="memory" v={`${listing.memoryGb} GB`} />
            <SpecRow k="compute" v={`${listing.tflops.toLocaleString("en-US")} TFLOPS FP16 (dense)`} />
            <SpecRow k="interconnect" v={listing.interconnect} />
            <SpecRow k="power limit" v={`${listing.powerLimitWatts} W / unit`} />
            <SpecRow k="units" v={String(listing.units)} />
            <SpecRow k="region" v={`${listing.region} · ${listing.city}`} />
            <SpecRow k="uptime" v={percentOfBps(listing.uptimeBps)} />
            <SpecRow k="util 24h" v={`${avgUtil24h(listing.id)}%`} accent />
          </dl>

          {related.length > 0 ? (
            <aside className="mt-8" aria-label="Other listings in this region">
              <h2 className="text-[10px] tracking-widest text-faint uppercase">
                Same region
              </h2>
              <ul className="mt-2 divide-y divide-hairline border border-hairline bg-panel">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/listings/${r.slug}`}
                      className="flex items-center justify-between px-3 py-2 text-xs text-dim transition-colors hover:bg-raised hover:text-ink"
                    >
                      <span className="truncate">
                        {r.id} · {r.chip}
                      </span>
                      <span className="text-accent tabular-nums">
                        {usd(r.priceCentsPerHour)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </Reveal>

        <div className="min-w-0 space-y-12">
          <Reveal>
            <UtilizationChart
              listingId={listing.id}
              powerLimitWatts={listing.powerLimitWatts}
            />
          </Reveal>
          <Reveal>
            <AvailabilityCalendar listingId={listing.id} />
          </Reveal>
          <Reveal>
            <ReservationForm listing={listing} />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
