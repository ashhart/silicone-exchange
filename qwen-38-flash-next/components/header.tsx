"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHydrated } from "@/lib/hooks";
import { useCompareStore } from "@/store/compare";
import { useTheme } from "./theme";
import { Logo } from "./ui";
import { cx } from "@/lib/cx";

const NAV = [
  { href: "/browse", label: "Browse" },
  { href: "/compare", label: "Compare" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const hydrated = useHydrated();
  const compareCount = useCompareStore((s) => s.ids.length);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-ink"
          aria-label="Silicon Exchange — home"
        >
          <Logo className="text-accent" />
          <span className="hidden font-display text-sm font-semibold tracking-[0.18em] uppercase sm:inline">
            Silicon<span className="text-accent">Exchange</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {NAV.map((item) => {
            const active =
              item.href === "/browse"
                ? pathname === "/browse" || pathname.startsWith("/listings")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "relative px-2 py-1.5 text-[11px] tracking-[0.14em] uppercase transition-colors sm:px-3",
                  active ? "text-accent" : "text-dim hover:text-ink",
                )}
              >
                {item.label}
                {item.href === "/compare" && hydrated && compareCount > 0 ? (
                  <span
                    className="ml-1 inline-grid h-4 min-w-4 place-items-center bg-accent px-0.5 text-[9px] font-semibold text-bg tabular-nums"
                    aria-label={`${compareCount} in compare`}
                  >
                    {compareCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="ml-1 grid h-8 w-8 place-items-center border border-hairline text-dim transition-colors hover:border-accent hover:text-accent"
          >
            {theme === "dark" ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
