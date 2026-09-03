# SILICON EXCHANGE

A marketplace where people rent out idle GPUs and AI accelerators by the hour.
Renters browse listings across six regions, inspect live utilization charts,
and reserve time blocks — all against mock data, entirely in the browser.

**Front end only.** No backend, no database, no API keys. All data is typed,
deterministic mock data defined in code; reservations persist to
`localStorage`.

## Stack

- Next.js (App Router) + TypeScript (strict)
- Tailwind CSS v4
- Framer Motion — micro-interactions and section reveals
- Recharts — utilization charts
- Zustand — client state (reservations, compare tray, theme)
- Vitest — unit tests for the pricing/booking rules

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other commands:

```bash
npm test         # run the Vitest suite (50 tests)
npm run lint     # ESLint
npm run build    # lint + type-check + production build
```

## Routes

| Route | What it does |
| --- | --- |
| `/` | Hero with a "GPUs online" counter computed from the mock fleet, feature cards, fleet preview |
| `/browse` | Filterable grid — search, region, memory range, status, sort. Filter state lives in the URL query string and survives refresh and the back button |
| `/listings/[slug]` | Spec sheet, 24-hour utilization chart with hover tooltip, 7-day availability calendar, reservation form with a live price quote |
| `/dashboard` | Your reservations from `localStorage`, live countdowns on holds, confirm/cancel, running total spend |
| `/compare` | Diff up to 3 listings side by side; selection persists across navigation |
| 404 | Custom on-brand not-found page |

## Pricing rules

All money is **integer cents** end to end — no floating point ever represents a
monetary value. The rules (`src/lib/pricing.ts`):

1. **Billed in 15-minute increments, rounded up.** A 61-minute booking bills
   as 75 minutes.
2. **Minimum billable block is 1 hour.** A 5-minute booking bills as 60
   minutes.
3. **Long-run discount.** Any reservation longer than 24 continuous hours
   gets 10% off every hour *beyond the 24th* — not off the whole booking.
   A 30-hour booking pays full rate for 24 hours, then 0.9× for 6 hours.
   The discount is floored to the whole cent.

Example: 30 hours at $3.20/hr → 24 × $3.20 + 6 × $2.88 = $94.08.

## Booking rules

- **Half-open intervals.** Ranges are `[start, end)`: a reservation ending at
  14:00 and one starting at 14:00 do **not** overlap (`src/lib/overlap.ts`).
- **Holds expire.** An unconfirmed hold lapses after 10 minutes and frees its
  slot; at exactly the 10-minute boundary it is still held
  (`src/lib/holds.ts`). The dashboard shows a live countdown.
- **Maintenance blocks new reservations** but leaves existing confirmed ones
  alone.
- **Persistence.** Reservations survive a full page reload via
  `localStorage`; the store rehydrates on first visit and seeds itself with
  deterministic sample data (including a live hold with ~8 minutes left).

## Deterministic data

30 days of hourly utilization per listing (720 samples × 24 listings) are
generated from a seeded PRNG (FNV-1a hash + mulberry32) keyed by listing id
and absolute hour — charts look organic but render identically on every
reload. `Math.random()` is never used for data.

## Tests

`tests/` covers the six required behaviors:

- Overlap detection, including the half-open 14:00/14:00 boundary
- The 15-minute round-up
- The 1-hour minimum
- The over-24-hour discount applied only to the excess hours
- Hold expiry at the 10-minute boundary (still held at exactly 10:00)
- The filter/sort reducer on a combined query, plus URL round-tripping

## Accessibility

Full keyboard navigation, visible focus rings, semantic headings, labelled
form controls, `aria` labels on icon buttons, and a text summary alternative
for every chart. Dark-first with a persisted light mode that applies before
first paint (no flash on reload).
