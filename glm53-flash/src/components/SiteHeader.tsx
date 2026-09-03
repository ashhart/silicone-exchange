"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTheme } from "@/stores/theme";
import { useCompare } from "@/stores/compare";
import { useReservations } from "@/stores/reservations";
import { effectiveStatus } from "@/lib/holds";
import { useReservationClock } from "@/lib/useReservationClock";

const NAV = [
  { href: "/browse", label: "Browse" },
  { href: "/compare", label: "Compare" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const theme = useTheme((s) => s.theme);
  const toggleTheme = useTheme((s) => s.toggle);
  const compareCount = useCompare((s) => s.ids.length);
  const reservations = useReservations((s) => s.reservations);
  const now = useReservationClock(15_000);

  const liveHolds = reservations.filter((r) => effectiveStatus(r, now) === "held").length;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="SILICON EXCHANGE home">
          <LogoMark />
          <span className="hidden font-display text-[15px] font-600 tracking-[0.18em] text-ink sm:inline">
            SILICON<span className="text-accent">·</span>EXCHANGE
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-auto flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
                {item.href === "/compare" && compareCount > 0 ? (
                  <span className="num ml-1.5 rounded bg-accent-soft px-1 text-[11px] text-accent">
                    {compareCount}
                  </span>
                ) : null}
                {active ? (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-[13px] h-px bg-accent"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                ) : null}
              </Link>
            );
          })}

          {liveHolds > 0 ? (
            <span
              className="num ml-2 hidden items-center gap-1.5 rounded-md border border-warn/40 bg-warn/10 px-2 py-1 text-[11px] text-warn sm:flex"
              title="Reservations on hold"
            >
              <span className="status-dot maintenance" />
              {liveHolds} hold{liveHolds === 1 ? "" : "s"}
            </span>
          ) : null}

          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </nav>
      </div>
    </header>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      className="ml-2 flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="20" height="20" rx="3" stroke="var(--accent)" strokeWidth="1.5" />
      <path d="M6 8h10M6 11h10M6 14h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-ink" />
      <circle cx="16" cy="14" r="1.6" fill="var(--accent)" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
    </svg>
  );
}
