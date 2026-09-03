"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export function HomeHero({ onlineCount, regionCount }: { onlineCount: number; regionCount: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-mesh" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="num text-[12px] uppercase tracking-[0.24em] text-accent"
        >
          GPU capacity marketplace
        </motion.p>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="mt-4 max-w-3xl font-display text-4xl font-700 leading-[1.05] tracking-tight text-ink sm:text-6xl"
        >
          Rent idle GPUs
          <br />
          by the{" "}
          <span className="relative inline-block">
            <span className="relative z-10">hour.</span>
            {!reduceMotion ? (
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 -z-0 h-[0.35em] bg-accent-soft"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                style={{ originX: 0 }}
              />
            ) : null}
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted"
        >
          Hoppers, Blackwells, Instincts and Ultra silicon — listed by the rack, metered by the
          quarter hour. Inspect live utilization, hold a block for ten minutes, confirm when your
          job is ready.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link
            href="/browse"
            className="rounded-md bg-accent px-5 py-2.5 text-[13px] font-600 text-bg transition-transform hover:scale-[1.02]"
          >
            Browse capacity
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-line-strong px-5 py-2.5 text-[13px] text-ink transition-colors hover:border-accent hover:text-accent"
          >
            My reservations
          </Link>
        </motion.div>

        <motion.dl
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-14 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line"
        >
          <HeroStat label="GPUs online" value={onlineCount} accent />
          <HeroStat label="Regions" value={regionCount} />
          <HeroStat label="Min. block" value="1 h" />
        </motion.dl>
      </div>
    </section>
  );
}

function HeroStat({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-surface px-4 py-4">
      <dt className="text-[10px] uppercase tracking-[0.14em] text-faint">{label}</dt>
      <dd className={`num mt-1 text-2xl font-500 ${accent ? "text-accent" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
