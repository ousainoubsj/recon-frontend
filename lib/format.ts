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
