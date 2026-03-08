import { getCurrency } from "@/lib/currencies";

export function formatCurrency(
  amount: number,
  currencyCode: string,
  opts?: { compact?: boolean }
): string {
  const currency = getCurrency(currencyCode);
  const decimals = currency?.decimal_places ?? 2;

  if (opts?.compact && Math.abs(amount) >= 1000) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      notation: "compact",
      maximumFractionDigits: 1,
    });
    return formatter.format(amount);
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return formatter.format(amount);
}

export function formatNumber(n: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatPercentage(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function isStaleValuation(dateStr: string | null | undefined, days = 90): boolean {
  if (!dateStr) return true;
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff > days * 24 * 60 * 60 * 1000;
}
