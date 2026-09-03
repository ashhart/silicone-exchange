export interface Region {
  id: string;
  label: string;
  code: string;
  city: string;
  country: string;
}

export const REGIONS: Region[] = [
  { id: "us-east-1", label: "US East", code: "IAD", city: "Ashburn, VA", country: "United States" },
  { id: "us-west-2", label: "US West", code: "PDX", city: "Boardman, OR", country: "United States" },
  { id: "eu-west-1", label: "EU West", code: "DUB", city: "Dublin", country: "Ireland" },
  { id: "eu-central-1", label: "EU Central", code: "FRA", city: "Frankfurt", country: "Germany" },
  { id: "ap-southeast-1", label: "AP Southeast", code: "SIN", city: "Singapore", country: "Singapore" },
  { id: "ap-northeast-1", label: "AP Northeast", code: "NRT", city: "Tokyo", country: "Japan" },
];

export const REGION_BY_ID: Record<string, Region> = Object.fromEntries(REGIONS.map((r) => [r.id, r]));
