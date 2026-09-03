import type { Metadata } from "next";
import { CompareClient } from "@/components/compare";

export const metadata: Metadata = {
  title: "Compare listings",
  description:
    "Diff up to three GPU listings side by side — specs, pricing, and live utilization.",
};

export default function ComparePage() {
  return <CompareClient />;
}
