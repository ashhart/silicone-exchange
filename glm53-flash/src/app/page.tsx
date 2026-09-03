import { LISTINGS } from "@/data/listings";
import { REGIONS } from "@/data/regions";
import { HomeHero } from "@/components/HomeHero";
import { FeatureCards } from "@/components/FeatureCards";
import { FleetPreview } from "@/components/FleetPreview";

export default function HomePage() {
  const onlineCount = LISTINGS.filter((l) => l.status === "available").length;
  const regionCount = REGIONS.length;
  const fleetPreview = [...LISTINGS]
    .filter((l) => l.status === "available")
    .sort((a, b) => b.tflops - a.tflops)
    .slice(0, 4);

  return (
    <>
      <HomeHero onlineCount={onlineCount} regionCount={regionCount} />
      <FeatureCards />
      <FleetPreview listings={fleetPreview} />
    </>
  );
}
