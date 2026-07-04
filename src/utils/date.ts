import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'

/**
 * Format a date string or Date object to a readable format.
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

/**
 * Format date with time.
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

/**
 * Format as relative time (e.g., "2 hours ago").
 */
export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Smart date: "Today", "Yesterday", or the date.
 */
export function formatSmartDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return `Today, ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday, ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, yyyy')
}

/**
 * Format date for input fields (YYYY-MM-DD).
 */
export function formatDateInput(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}
