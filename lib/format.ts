// REC-YYYY-NNNNNN — null if the report has never completed (sequenceYear/
// sequenceNumber are only assigned once a report first reaches 'completed').
export function formatReportReference(sequenceYear: number | null | undefined, sequenceNumber: number | null | undefined): string | null {
  if (sequenceYear == null || sequenceNumber == null) return null
  return `REC-${sequenceYear}-${String(sequenceNumber).padStart(6, '0')}`
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad2 = (n: number) => String(n).padStart(2, '0')

// Matches lib/settingsOptions.ts's DATE_FORMAT_OPTIONS values exactly — these
// are literal display patterns the org picks in Settings, not Intl locale
// tags, so they need their own formatter rather than an Intl locale swap.
export function formatDatePattern(date: Date, pattern: string): string {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  switch (pattern) {
    case 'DD MMM YYYY':
      return `${pad2(day)} ${MONTHS_SHORT[month - 1]} ${year}`
    case 'YYYY-MM-DD':
      return `${year}-${pad2(month)}-${pad2(day)}`
    case 'DD/MM/YYYY':
      return `${pad2(day)}/${pad2(month)}/${year}`
    case 'MM/DD/YYYY':
      return `${pad2(month)}/${pad2(day)}/${year}`
    case 'MMM DD, YYYY':
    default:
      return `${MONTHS_SHORT[month - 1]} ${pad2(day)}, ${year}`
  }
}

// `pattern` defaults to today's hardcoded display so every existing call site
// (and any render before the org's Date Format setting has loaded) behaves
// exactly as before — lib/hooks/useOrgFormat.ts is what actually supplies the
// org's saved pattern.
export function formatDate(value: string | Date | null | undefined, pattern: string = 'MMM DD, YYYY'): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return formatDatePattern(date, pattern)
}

export function formatDateTime(value: string | Date | null | undefined, pattern: string = 'MMM DD, YYYY'): string {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${formatDatePattern(date, pattern)}, ${time}`
}

// CLDR has no currency symbol for these — Intl falls back to printing the
// ISO code itself (e.g. "GMD 1,234.50"), which reads worse than the plain
// letter symbol this codebase's own CURRENCY_OPTIONS labels already use.
const CURRENCY_SYMBOL_OVERRIDES: Record<string, string> = {
  GMD: 'D',
}

// `currency` defaults to USD so existing call sites are unaffected;
// lib/hooks/useOrgFormat.ts supplies the org's saved Currency setting.
export function formatCurrency(value: number | string | null | undefined, currency: string = 'USD'): string {
  if (value == null) return ''
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return ''
  const symbol = CURRENCY_SYMBOL_OVERRIDES[currency]
  if (symbol) return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return num.toLocaleString('en-US', { style: 'currency', currency })
}

// Just the symbol (e.g. "$", "€"), not a full formatted amount — for suffix/
// prefix badges on bare numeric inputs (e.g. Settings' amount tolerance
// field) where formatCurrency's full number formatting doesn't apply.
export function getCurrencySymbol(currency: string = 'USD'): string {
  const override = CURRENCY_SYMBOL_OVERRIDES[currency]
  if (override) return override
  const part = new Intl.NumberFormat('en-US', { style: 'currency', currency })
    .formatToParts(0)
    .find((p) => p.type === 'currency')
  return part?.value ?? currency
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value == null) return ''
  const num = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(num)) return ''
  return num.toLocaleString('en-US')
}

export function formatDuration(ms: number | null | undefined): string {
  if (ms == null || Number.isNaN(ms)) return ''
  const totalSeconds = ms / 1000
  if (totalSeconds < 60) return `${totalSeconds.toFixed(totalSeconds < 10 ? 1 : 0)}s`
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  return `${minutes}m ${seconds}s`
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
// ("Just now", "2 hours ago", "1 day ago", "15 days ago", "3 months ago",
// "2 years ago"), which is a different convention from formatRelativeTime above.
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

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`

  const diffYears = Math.floor(diffDays / 365)
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`
}
