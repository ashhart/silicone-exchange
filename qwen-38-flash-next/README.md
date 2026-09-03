# Silicon Exchange

A fictional GPU-rental marketplace built as a production-grade front end:
24 mock listings across 8 regions, seeded 30-day hourly telemetry, and a
reservation engine whose pricing, overlap, and hold-expiry rules are pure,
unit-tested TypeScript. No backend, no database, no API keys — all data is
typed mock data in `/data`, and everything the user does (filtering, booking,
cancelling) actually works.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest — 54 unit tests
npm run build      # production build (zero TS / ESLint errors)
npm run lint
```

Reservations persist to `localStorage` (`silicon-exchange.reservations.v1`);
the compare selection to `silicon-exchange.compare.v1`. Clear those keys to
get a fresh seed.

## Pages

| Route              | What it does                                                                  |
| ------------------ | ----------------------------------------------------------------------------- |
| `/`                | Hero, live "GPUs online" counter computed from the listing data, board teaser |
| `/browse`          | 24 cards; search, region, memory-range, status filters + 6 sorts in the URL   |
| `/listings/[slug]` | Spec sheet, 24h chart (hover tooltip + text summary), 7-day calendar, live-quote booking form |
| `/dashboard`       | Reservations from localStorage, hold countdowns, confirm/cancel, running spend |
| `/compare`         | Diff up to 3 listings, best-in-row highlighted, selection persists anywhere    |
| any unknown path   | Custom on-brand 404                                                            |

Filter state is the URL query string: deep links, refresh, and the browser
back button all restore the exact board.

## The rules that make it real

All of this lives in `lib/` as pure functions (`money.ts`, `overlap.ts`,
`hold.ts`, `filters.ts`) with tests in `*.test.ts` beside them.

### Pricing (integer cents, never floats)

- Billed in **15-minute increments, always rounded up** (`billableMinutes`).
- **Minimum billable block is 1 hour** — a 10-minute booking still costs an hour.
- Any reservation longer than **24 continuous hours gets 10% off every hour
  beyond the 24th** — the discount applies only to the excess window, never to
  the first 24 hours, and the excess is measured after the 15-minute round-up.
- Rate × time is divided out with integer arithmetic and rounded **half-up to
  the nearest cent**; no floating-point value ever touches an amount.
- The booking form quotes every range change live: base hours, applied
  rounding, discount, and total.

### Scheduling

- Time ranges are **half-open** `[start, end)`: one booking ending at 14:00
  and another starting at 14:00 do not conflict (the seed data includes this
  exact back-to-back pair; a naive `<=` check would reject it).
- **Cancelled reservations and expired holds never block a slot**; confirmed
  and live-held ones always do.
- **Holds expire after 10 minutes** (strictly more than 10 minutes without
  confirmation). The UI drives a real per-second countdown; an expiry sweeper
  flips stored holds to `expired` and frees the slot.
- **Maintenance blocks new reservations** but leaves existing confirmed ones
  running (see listing `SX-10`).

### Data

- 24 listings (H100/H200/B200/MI300X/MI325X/RTX 5090/5090/M3 Ultra/…) with
  chip, memory GB, dense FP16 TFLOPS, integer-cent hourly rate, status
  `available | maintenance | retired`, units, power limit, interconnect, uptime.
- 30 days × 24 hourly utilization (0–100%) + watts samples per listing,
  generated from a seeded mulberry32 PRNG against a fixed epoch anchor —
  organic-looking, identical on every reload. Zero `Math.random()` at render
  time, zero external image or font requests at runtime (fonts are self-hosted
  via `next/font`).

## Tech

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · Framer Motion ·
Recharts · Zustand (persisted stores) · Vitest. Dark-first theme with a
persisted, no-flash light mode. Full keyboard navigation, labelled controls,
and a text summary for every chart.
