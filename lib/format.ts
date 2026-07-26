export function formatDate(value: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', options ?? { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value == null) return ''
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return ''
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value == null) return ''
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return ''
  return num.toLocaleString('en-US')
}

export function formatPercent(value: number | string | null | undefined, fractionDigits = 2): string {
  if (value == null) return ''
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return ''
  return `${num.toFixed(fractionDigits)}%`
}

// "10:24 AM" for today, "Yesterday", "N days ago" for the last week, then
// falls back to a plain date — matches ActivityOverview's mock time column.
export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayDiff = Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / (24 * 60 * 60 * 1000))

  if (dayDiff <= 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (dayDiff === 1) return 'Yesterday'
  if (dayDiff < 7) return `${dayDiff} days ago`
  if (dayDiff < 30) return `${Math.floor(dayDiff / 7)} week${Math.floor(dayDiff / 7) === 1 ? '' : 's'} ago`
  if (dayDiff < 365) return `${Math.floor(dayDiff / 30)} month${Math.floor(dayDiff / 30) === 1 ? '' : 's'} ago`
  return formatDate(date)
}

// Pure "N unit(s) ago" phrasing throughout, no clock time and no "Yesterday"
// special-case — matches the Team page's "Last Active" mock column exactly
// ("Just now", "2 hours ago", "1 day ago", "15 days ago"), which is a
// different convention from formatRelativeTime above.
export function formatTimeAgo(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''

  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`

  return formatDate(date)
}
