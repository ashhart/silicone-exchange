import type { SortKey, StatusFilter } from "@/lib/filters";

export const LISTING_SORT_LABEL: Record<SortKey, string> = {
  "price-asc": "Price · low to high",
  "price-desc": "Price · high to low",
  "memory-desc": "Memory · high first",
  "tflops-desc": "Compute · fastest first",
  "utilization-desc": "Utilization · busiest first",
};

export const STATUS_FILTER_LABEL: Record<StatusFilter, string> = {
  all: "All statuses",
  available: "Available",
  maintenance: "In maintenance",
  retired: "Retired",
};

export const REGION_LABEL: Record<string, string> = Object.fromEntries(
  REGIONS_LABEL_PAIRS(),
);

function REGIONS_LABEL_PAIRS(): Array<[string, string]> {
  // Kept as a function to avoid a circular import with the data layer.
  return [
    ["us-west-2", "Oregon, US"],
    ["us-east-1", "Virginia, US"],
    ["eu-central-1", "Frankfurt, DE"],
    ["ap-northeast-1", "Tokyo, JP"],
    ["ap-south-1", "Mumbai, IN"],
    ["sa-east-1", "São Paulo, BR"],
  ];
}
