const CURRENCY_SYMBOL = '₱'

/**
 * Format a number as Philippine Peso currency.
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return `${CURRENCY_SYMBOL}0.00`
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format a compact currency (e.g., ₱1.2K, ₱3.4M).
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `${CURRENCY_SYMBOL}${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `${CURRENCY_SYMBOL}${(amount / 1_000).toFixed(1)}K`
  }
  return formatCurrency(amount)
}

/**
 * Parse a currency string back to number.
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[₱,\s]/g, '')
  return parseFloat(cleaned) || 0
}
