import type { Region } from "@/lib/types";

export const REGIONS: Region[] = [
  { code: "us-west-2", label: "Oregon, US", site: "PDX" },
  { code: "us-east-1", label: "Virginia, US", site: "IAD" },
  { code: "eu-central-1", label: "Frankfurt, DE", site: "FRA" },
  { code: "ap-northeast-1", label: "Tokyo, JP", site: "NRT" },
  { code: "ap-south-1", label: "Mumbai, IN", site: "BOM" },
  { code: "sa-east-1", label: "São Paulo, BR", site: "GRU" },
];

export const REGION_BY_CODE: Record<string, Region> = Object.fromEntries(
  REGIONS.map((r) => [r.code, r]),
);
