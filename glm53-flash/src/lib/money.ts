/**
 * Money helpers. All amounts are integer cents end to end; no floating
 * point ever represents a monetary value.
 */
export function formatCents(cents: number): string {
  const negative = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  const grouped = dollars.toLocaleString("en-US");
  return `${negative ? "-" : ""}$${grouped}.${String(remainder).padStart(2, "0")}`;
}

export function formatCentsPerHour(cents: number): string {
  return `${formatCents(cents)}/hr`;
}
