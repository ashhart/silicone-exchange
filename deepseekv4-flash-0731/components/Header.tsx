"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { availableCount } from "@/data/listings";

const NAV = [
  { href: "/browse", label: "Browse" },
  { href: "/compare", label: "Compare" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="Silicon Exchange home">
          <Logo className="h-7 w-7 transition-transform group-hover:scale-105" />
          <span className="hidden font-display text-sm font-semibold tracking-tight sm:inline">
            SILICON<span className="text-accent">EXCHANGE</span>
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1" aria-label="Primary">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-2 py-2 text-[13px] transition-colors sm:px-3 sm:text-sm ${
                  active
                    ? "bg-surface2 font-medium text-ink"
                    : "text-muted hover:bg-surface2 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 sm:flex" aria-label="GPUs online">
          <span className="sx-pulse-dot h-1.5 w-1.5 rounded-full bg-ok" aria-hidden="true" />
          <span className="font-mono text-xs text-muted">
            <span className="font-semibold text-ok">{availableCount}</span> online
          </span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
