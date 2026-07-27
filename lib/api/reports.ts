import { apiFetch } from './client'
import type {
  BulkExportInput,
  HistoryStats,
  ListReportsParams,
  MatchRateBucket,
  Report,
  ReportTag,
  ReportsSummary,
  ReportsTrend,
  TopFilePair,
} from '@/types/reports'

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
      status: params?.status,
    },
  })
}

export function getById(id: string) {
  return apiFetch.get<Report>(`/reports/${id}`)
}

export function getHistoryStats() {
  return apiFetch.get<HistoryStats>('/reports/history-stats')
}

export function getMatchRateDistribution() {
  return apiFetch.get<MatchRateBucket[]>('/reports/match-rate-distribution')
}

export function getTopFilePairs() {
  return apiFetch.get<TopFilePair[]>('/reports/top-file-pairs')
}

export function listDrafts() {
  return apiFetch.get<Report[]>('/reports/drafts')
}

export function bulkDelete(ids: string[]) {
  return apiFetch.post<{ deletedCount: number }>('/reports/bulk-delete', { ids })
}

export function bulkExport(input: BulkExportInput) {
  return apiFetch.postForBlob('/reports/bulk-export', input)
}

export function updateTag(id: string, tag: ReportTag | null) {
  return apiFetch.patch<Report>(`/reports/${id}/tag`, { tag })
}

export function addFavorite(id: string) {
  return apiFetch.put<void>(`/reports/${id}/favorite`)
}

export function removeFavorite(id: string) {
  return apiFetch.del<void>(`/reports/${id}/favorite`)
}
