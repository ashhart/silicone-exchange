import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2.5">
          <Logo className="h-5 w-5" />
          <span className="text-xs text-muted">
            Silicon Exchange — idle silicon, metered by the hour.
          </span>
        </div>
        <div className="flex items-center gap-5 text-xs text-muted">
          <Link href="/browse" className="transition-colors hover:text-ink">
            Browse
          </Link>
          <Link href="/compare" className="transition-colors hover:text-ink">
            Compare
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-ink">
            Dashboard
          </Link>
          <span className="font-mono text-faint">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
