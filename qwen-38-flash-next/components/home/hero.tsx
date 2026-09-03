"use client";

import Link from "next/link";
import { CountUp, EASE, HeroGlow, Reveal } from "@/components/motion";
import { Stat } from "@/components/ui";
import { motion } from "framer-motion";

export interface HomeStats {
  onlineUnits: number;
  nodes: number;
  regions: number;
  cheapestCents: number;
  avgUtilPct: number;
}

export function HeroBlock({ stats }: { stats: HomeStats }) {
  return (
    <section className="grid-bg relative overflow-hidden border-b border-hairline">
      <HeroGlow />
      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 sm:px-6 md:pt-28 md:pb-24">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[11px] tracking-[0.3em] text-accent uppercase"
        >
          The idle-compute exchange
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
          className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-6xl"
        >
          Idle GPUs, billed by the{" "}
          <span className="bg-gradient-to-r from-accent via-ink to-accent bg-clip-text text-transparent">
            quarter hour
          </span>
          .
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="mt-5 max-w-xl text-sm leading-relaxed text-dim md:text-base"
        >
          {stats.nodes} listings · {stats.regions} regions. Reserve live
          hardware with conflict-safe time blocks, real utilization telemetry,
          and pricing that never leaves integer cents.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/browse"
            className="border border-accent bg-accent px-5 py-2.5 text-xs font-semibold tracking-[0.14em] text-bg uppercase transition-transform hover:-translate-y-0.5"
          >
            Open the board
          </Link>
          <Link
            href="/dashboard"
            className="border border-hairline px-5 py-2.5 text-xs tracking-[0.14em] text-dim uppercase transition-colors hover:border-accent hover:text-accent"
          >
            My reservations
          </Link>
        </motion.div>

        <Reveal delay={0.4} className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-hairline pt-10 md:grid-cols-4">
          <div>
            <Stat
              label="GPUs online"
              value={<CountUp to={stats.onlineUnits} />}
              sub="across available listings"
            />
          </div>
          <Stat
            label="Regions"
            value={<CountUp to={stats.regions} duration={1.1} />}
            sub="on four continents"
          />
          <Stat
            label="Avg utilization"
            value={
              <CountUp
                to={stats.avgUtilPct}
                duration={1.6}
                format={(n) => `${Math.round(n)}%`}
              />
            }
            sub="trailing 24h, all nodes"
          />
          <Stat
            label="Cheapest node"
            value={
              <CountUp
                to={stats.cheapestCents}
                duration={1.6}
                format={(n) => `$${(Math.round(n) / 100).toFixed(2)}/h`}
              />
            }
            sub="per GPU-hour, available"
          />
        </Reveal>
      </div>
    </section>
  );
}
