import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'
import { useOrganizationInfo } from './useSettings'

// Binds the locale-dependent formatters to the org's saved Date Format/
// Currency (Settings → Organization Info) — every other formatter in
// lib/format.ts has no corresponding org setting and stays a plain import.
// Falls back to the same defaults lib/format.ts itself uses while
// useOrganizationInfo() is still loading, so no new loading-state branches
// are needed at call sites.
export function useOrgFormat() {
  const { data: orgInfo } = useOrganizationInfo()
  const pattern = orgInfo?.dateFormat ?? 'MMM DD, YYYY'
  const currency = orgInfo?.currency ?? 'USD'

  return {
    formatDate: (value: string | Date | null | undefined) => formatDate(value, pattern),
    formatDateTime: (value: string | Date | null | undefined) => formatDateTime(value, pattern),
    formatCurrency: (value: number | string | null | undefined) => formatCurrency(value, currency),
  }
}
