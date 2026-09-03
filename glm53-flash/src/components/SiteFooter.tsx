import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-[12px] text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="font-display tracking-[0.18em] text-muted">SILICON·EXCHANGE</div>
          <p className="mt-1 max-w-md">
            A fictional marketplace for idle GPU capacity. All listings, utilization data and
            reservations are simulated in your browser — nothing leaves this machine.
          </p>
        </div>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/browse" className="transition-colors hover:text-ink">
            Browse capacity
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-ink">
            My reservations
          </Link>
          <Link href="/compare" className="transition-colors hover:text-ink">
            Compare
          </Link>
        </nav>
      </div>
    </footer>
  );
}
