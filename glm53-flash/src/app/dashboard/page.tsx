import type { Metadata } from "next";
import { DashboardClient } from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "My reservations",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
