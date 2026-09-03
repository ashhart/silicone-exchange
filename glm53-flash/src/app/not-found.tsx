import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4">
      <div className="hero-grid" aria-hidden="true" />
      <div className="relative text-center">
        <p className="num text-[12px] uppercase tracking-[0.24em] text-accent">Error 404 · segment not found</p>
        <h1 className="mt-4 font-display text-7xl font-700 tracking-tight text-ink sm:text-8xl">
          4<span className="text-accent">0</span>4
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[14px] leading-relaxed text-muted">
          This address isn&apos;t in the exchange&apos;s routing table. The unit you are looking for may
          have been retired, or the link never existed.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-accent px-5 py-2.5 text-[13px] font-600 text-bg transition-transform hover:scale-[1.02]"
          >
            Back to the floor
          </Link>
          <Link
            href="/browse"
            className="rounded-md border border-line-strong px-5 py-2.5 text-[13px] text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Browse capacity
          </Link>
        </div>
      </div>
    </div>
  );
}
