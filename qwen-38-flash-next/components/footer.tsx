export function Footer() {
  return (
    <footer className="mt-20 border-t border-hairline">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-[11px] text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          SILICON EXCHANGE — a fictional GPU rental marketplace. All listings,
          telemetry, and bookings are mock data.
        </p>
        <p className="tabular-nums">
          RATES IN INTEGER CENTS · BILLING 15-MIN BLOCKS · HOLDS 10:00
        </p>
      </div>
    </footer>
  );
}
