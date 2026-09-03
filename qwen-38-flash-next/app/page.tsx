import Link from "next/link";
import { LISTINGS } from "@/data/listings";
import { avgUtil24h } from "@/data/utilization";
import { usd } from "@/lib/format";
import { HeroBlock } from "@/components/home/hero";
import { Reveal } from "@/components/motion";
import { ListingStatusBadge } from "@/components/ui";

export default function HomePage() {
  const available = LISTINGS.filter((l) => l.status === "available");
  const onlineUnits = available.reduce((sum, l) => sum + l.units, 0);
  const regions = new Set(LISTINGS.map((l) => l.region)).size;
  const cheapest = Math.min(...available.map((l) => l.priceCentsPerHour));
  const avgUtil = Math.round(
    LISTINGS.reduce((sum, l) => sum + avgUtil24h(l.id), 0) / LISTINGS.length,
  );

  const board = [...available]
    .sort((a, b) => a.priceCentsPerHour - b.priceCentsPerHour)
    .slice(0, 6);

  return (
    <>
      <HeroBlock
        stats={{
          onlineUnits,
          nodes: LISTINGS.length,
          regions,
          cheapestCents: cheapest,
          avgUtilPct: avgUtil,
        }}
      />

      <section
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
        aria-labelledby="how-it-works"
      >
        <Reveal>
          <h2
            id="how-it-works"
            className="font-display text-2xl font-semibold tracking-tight md:text-3xl"
          >
            Built like a matching engine, priced like a utility.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
          {[
            {
              no: "01",
              title: "Live telemetry, not stock photos",
              body: "Every listing ships 30 days of hourly utilization and power samples — seeded, deterministic, and chartable down to the hour before you commit a cent.",
            },
            {
              no: "02",
              title: "Half-open time blocks",
              body: "Reservations are [start, end). A booking ending at 14:00 never collides with one starting at 14:00 — and no two live bookings ever share a slot.",
            },
            {
              no: "03",
              title: "Cent-exact billing",
              body: "15-minute increments, rounded up, 1-hour minimum. Past 24 continuous hours the excess drops 10%. Floats never touch the math — it is all integers.",
            },
          ].map((f, i) => (
            <Reveal key={f.no} delay={i * 0.08}>
              <article className="h-full bg-panel p-6 transition-colors hover:bg-raised">
                <div className="text-[11px] tracking-widest text-accent">
                  {f.no}
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-dim">
                  {f.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-4 pb-16 sm:px-6"
        aria-labelledby="live-board"
      >
        <Reveal>
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="live-board"
              className="font-display text-2xl font-semibold tracking-tight md:text-3xl"
            >
              Cheapest nodes online
            </h2>
            <Link
              href="/browse"
              className="shrink-0 border border-hairline px-3 py-1.5 text-[11px] tracking-[0.14em] text-dim uppercase transition-colors hover:border-accent hover:text-accent"
            >
              All {LISTINGS.length} listings →
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="mt-6 divide-y divide-hairline border border-hairline bg-panel">
            {board.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/listings/${l.slug}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm transition-colors hover:bg-raised"
                >
                  <span className="w-14 text-faint tabular-nums">{l.id}</span>
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {l.chip}
                    <span className="text-faint"> · {l.city}</span>
                  </span>
                  <span className="text-dim tabular-nums">
                    {avgUtil24h(l.id)}%
                    <span className="text-faint"> util 24h</span>
                  </span>
                  <span className="font-display w-24 text-right font-semibold text-accent tabular-nums">
                    {usd(l.priceCentsPerHour)}
                    <span className="font-mono text-[10px] text-faint">/h</span>
                  </span>
                  <ListingStatusBadge status={l.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </>
  );
}
