"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

export const EASE = [0.22, 0.61, 0.21, 1] as const;

/** Scroll-triggered reveal; respects reduced motion via framer defaults. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Count from 0 to `to` once the element scrolls into view. */
export function CountUp({
  to,
  duration = 1.4,
  format = (n: number) => String(Math.round(n)),
}: {
  to: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-32px" });
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => format(v));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, { duration, ease: EASE });
    return () => controls.stop();
  }, [inView, to, duration, value]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{text}</motion.span>
    </span>
  );
}

/** Soft animated volt glow behind the hero headline. */
export function HeroGlow() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[min(720px,90vw)] -translate-x-1/2 opacity-45 blur-[90px] dark:opacity-35"
      style={{
        background:
          "radial-gradient(45% 55% at 50% 50%, var(--accent) 0%, transparent 70%)",
      }}
      animate={{ scale: [1, 1.18, 1], x: [-14, 14, -14], opacity: [0.35, 0.6, 0.35] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
