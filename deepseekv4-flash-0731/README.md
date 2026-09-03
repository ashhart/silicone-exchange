# Silicon Exchange

A front-end marketplace where people rent idle GPUs and AI accelerators by the
hour. Browse live listings, inspect 30 days of utilization, drag-select time
blocks on a 7-day availability calendar, and reserve compute with real pricing
math — all mock data, no backend.

Built with **Next.js (App Router) + TypeScript (strict) + Tailwind CSS +
Framer Motion + Recharts + Zustand + Vitest**.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm test           # Vitest unit tests (pure logic)
npm run build      # production build (zero TS + ESLint errors)
npm run lint       # ESLint
```

## Pages

- **/** — hero with a live "GPUs online" counter computed from the mock data.
- **/browse** — searchable, filterable, sortable grid. Filter state lives in the
  URL query string, so it survives refresh and the browser back button.
- **/listings/[slug]** — spec sheet, 24-hour utilization chart (Recharts, with
  hover tooltip and a text alternative), 7-day availability calendar with drag
  selection, and a live price quote that recalculates as you drag.
- **/dashboard** — your reservations (persisted to localStorage), countdowns on
  held slots, cancel/confirm actions, and running total spend.
- **/compare** — up to 3 listings side by side; selection persists across
  navigation.
- **404** — custom, on-brand.

## How the pricing rules work

All money is **integer cents** — no floating point anywhere in the math.

1. **15-minute billing, rounded up.** A booking of 1h 10m is billed as 1h 15m.
   The billable time is `ceil(minutes / 15) × 15`.
2. **1-hour minimum.** Anything shorter bills a full hour.
3. **Over-24-hour discount.** The first 24 hours bill at the full hourly rate.
   Every hour beyond the 24th bills at **90%** — the discount applies only to
   the excess hours, never to the first day. Per-block price is `rate / 4`
   (4 blocks per hour) and the total rounds up to a whole cent.

The pure functions live in `lib/pricing.ts`, `lib/overlap.ts`, `lib/filters.ts`
and `lib/holds.ts`, and are covered by the Vitest suite in `tests/`.

## Other behavior worth knowing

- **Overlap is half-open.** A reservation ending at 14:00 and one starting at
  14:00 do not overlap. Cancelled and expired reservations never block a slot;
  held and confirmed ones do.
- **Holds expire.** Holding a slot reserves it for 10 minutes with a visible
  countdown. If it is not confirmed in time, it flips to `expired` and frees
  the slot — driven by a real timer.
- **Maintenance** blocks new reservations but leaves existing confirmed ones
  alone.
- **Deterministic data.** Listings, chips, and 30 days of hourly utilization
  are generated from a seeded PRNG (`lib/rng.ts`) — identical on every reload,
  no `Math.random()` at render time.
- **Dark-first with a real light mode.** The theme is applied pre-paint from an
  inline script, so there is no flash on reload.
