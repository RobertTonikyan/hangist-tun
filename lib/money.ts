const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const cents = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });

// 100482.5 → "$100,483"
export function usd(value: number) {
  return dollars.format(value);
}

// 188.1 → "$188.10"
export function usdCents(value: number) {
  return cents.format(value);
}

// 621 → "+$621",  -90 → "−$90"
export function signedUsd(value: number) {
  return `${value >= 0 ? "+" : "−"}${usd(Math.abs(value))}`;
}

// 0.62 → "+0.62%"
export function signedPct(value: number) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}%`;
}