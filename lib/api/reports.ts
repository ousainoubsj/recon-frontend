import { apiFetch } from './client'
import type { ListReportsParams, Report, ReportsSummary, ReportsTrend } from '@/types/reports'

export function getSummary() {
  return apiFetch.get<ReportsSummary>('/reports/summary')
}

export function getTrend(months?: number) {
  return apiFetch.get<ReportsTrend>('/reports/trend', { query: { months } })
}

export function list(params?: ListReportsParams) {
  return apiFetch.get<Report[]>('/reports', {
    query: {
      limit: params?.limit,
      offset: params?.offset,
      q: params?.q,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo,
      tag: params?.tag,
      favoritesOnly: params?.favoritesOnly,
    },
  })
}
