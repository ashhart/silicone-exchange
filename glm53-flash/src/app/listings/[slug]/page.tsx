import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LISTINGS, LISTING_BY_SLUG } from "@/data/listings";
import { REGION_BY_CODE } from "@/data/regions";
import { formatCentsPerHour } from "@/lib/money";
import { DetailClient } from "@/components/DetailClient";

export function generateStaticParams() {
  return LISTINGS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const listing = LISTING_BY_SLUG[slug];
  if (!listing) return { title: "Listing not found" };
  return { title: `${listing.vendor} ${listing.chip} · ${listing.id}` };
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = LISTING_BY_SLUG[slug];
  if (!listing) notFound();

  const region = REGION_BY_CODE[listing.region];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <DetailClient
        listing={listing}
        regionLabel={region?.label ?? listing.region}
        rateLabel={formatCentsPerHour(listing.hourlyRateCents)}
      />
    </div>
  );
}
