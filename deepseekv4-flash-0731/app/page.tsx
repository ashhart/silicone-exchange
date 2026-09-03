import Link from "next/link";
import { LISTINGS, REGION_COUNT, availableCount } from "@/data/listings";
import { CHIPS } from "@/data/chips";
import { formatMoney } from "@/lib/time";
import { SectionReveal } from "@/components/SectionReveal";
import { ListingCard } from "@/components/ListingCard";

const FEATURES = [
  {
    title: "Metered by the hour",
    body: "15-minute billing, rounded up, with a 1-hour minimum. Bookings past 24 hours get 10% off every excess hour — never the first day.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: "Live utilization",
    body: "Every node streams 30 days of hourly utilization and power draw. See what you are renting before you rent it.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <path d="M3 17l5-6 4 3 6-8 3 3" />
        <path d="M3 21h18" />
      </svg>
    ),
  },
  {
    title: "Holds that expire",
    body: "Reserve a slot in one click. It stays held for 10 minutes with a live countdown — confirm or it frees itself.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <path d="M12 6v6l4 2" />
        <path d="M12 3a9 9 0 1 0 9 9" />
      </svg>
    ),
  },
];

export default function HomePage() {
  const cheapest = Math.min(...LISTINGS.map((l) => l.hourlyRateCents));
  const featured = LISTINGS.filter((l) => l.status === "available").slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in srgb, var(--sx-accent) 14%, transparent), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden="true"
          style={{
            backgroundImage:
              "linear-gradient(var(--sx-line) 1px, transparent 1px), linear-gradient(90deg, var(--sx-line) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(70% 60% at 50% 30%, black, transparent)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28">
          <SectionReveal>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              GPU marketplace · hourly rentals
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Idle silicon,{" "}
              <span className="sx-hero-gradient">metered by the hour.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
              Silicon Exchange connects you to spare H100s, B200s, MI300Xs and more — live
              utilization, transparent pricing, and reservations that actually hold.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accentink transition-opacity hover:opacity-90"
              >
                Browse compute
              </Link>
              <Link
                href="/compare"
                className="rounded-md border border-line2 bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent/50 hover:text-accent"
              >
                Compare nodes
              </Link>
            </div>
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
              {[
                { label: "GPUs online", value: String(availableCount), live: true },
                { label: "Regions", value: String(REGION_COUNT) },
                { label: "Accelerators", value: String(CHIPS.length) },
                { label: "From", value: `${formatMoney(cheapest)}/hr` },
              ].map((stat) => (
                <div key={stat.label} className="bg-surface px-4 py-4">
                  <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 font-mono text-2xl font-semibold text-ink">
                    {stat.live && (
                      <span className="sx-pulse-dot h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
                    )}
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </SectionReveal>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionReveal>
          <h2 className="font-display text-2xl font-bold tracking-tight">Built like a trading desk</h2>
          <p className="mt-2 max-w-lg text-sm text-muted">
            Data-dense, deterministic, and honest about the math.
          </p>
        </SectionReveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <SectionReveal key={feature.title} delay={i * 0.08}>
              <div className="h-full rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                  {feature.icon}
                </div>
                <h3 className="mt-4 font-display text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* Featured listings */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <SectionReveal>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">On the floor now</h2>
              <p className="mt-2 text-sm text-muted">A sample of what is available this hour.</p>
            </div>
            <Link
              href="/browse"
              className="font-mono text-xs text-accent underline-offset-2 hover:underline"
            >
              View all →
            </Link>
          </div>
        </SectionReveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
