import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowseClient } from "@/components/browse";

export const metadata: Metadata = {
  title: "Browse listings",
  description:
    "Filter and sort every GPU listing on the exchange by chip, region, memory, status, and live utilization.",
};

/**
 * The URL query string is the single source of truth for filter state:
 * BrowseClient renders from useSearchParams, so refresh, deep links, and the
 * browser back button all land on the exact same board.
 */
export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <BrowseClient />
    </Suspense>
  );
}
