import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowseClient } from "@/components/BrowseClient";

export const metadata: Metadata = {
  title: "Browse capacity",
};

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 text-[13px] text-faint sm:px-6">Loading fleet…</div>}>
      <BrowseClient />
    </Suspense>
  );
}
