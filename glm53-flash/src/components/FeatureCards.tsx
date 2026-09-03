"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const FEATURES = [
  {
    title: "Metered by the quarter hour",
    body: "Billing rounds up to 15-minute increments with a one-hour minimum. Book 25 hours and only the hour past the 24th gets the long-run discount.",
    stat: "15 min",
    statLabel: "billing increment",
  },
  {
    title: "Ten-minute holds",
    body: "Put a block on hold while you stage your job. Confirm inside the window and it is yours; let the timer lapse and the slot frees itself automatically.",
    stat: "10 min",
    statLabel: "hold window",
  },
  {
    title: "Live utilization, real math",
    body: "Every listing carries 30 days of hourly utilization and power telemetry. The calendar blocks out exactly the hours other tenants already hold.",
    stat: "720 h",
    statLabel: "telemetry per unit",
  },
];

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <h2 className="sr-only">How the exchange works</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.article
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
            className="lift rounded-lg border border-line bg-surface p-6"
          >
            <div className="num text-[11px] uppercase tracking-[0.14em] text-accent">{feature.stat}</div>
            <div className="num mt-0.5 text-[10px] uppercase tracking-[0.14em] text-faint">{feature.statLabel}</div>
            <h3 className="mt-4 font-display text-[17px] font-600 text-ink">{feature.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{feature.body}</p>
          </motion.article>
        ))}
      </div>
      <p className="mt-6 text-center text-[12px] text-faint">
        New to the exchange?{" "}
        <Link href="/browse" className="text-accent underline-offset-4 hover:underline">
          Start from the fleet
        </Link>
      </p>
    </section>
  );
}
