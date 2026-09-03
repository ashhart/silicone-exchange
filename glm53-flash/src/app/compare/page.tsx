import type { Metadata } from "next";
import { CompareClient } from "@/components/CompareClient";

export const metadata: Metadata = {
  title: "Compare units",
};

export default function ComparePage() {
  return <CompareClient />;
}
