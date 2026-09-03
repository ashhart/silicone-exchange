import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your reservations, hold countdowns, and running spend — persisted to localStorage.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
