import { apiFetch } from './client'
import type {
  BreakBreakdownItem,
  BulkExportInput,
  DraftInput,
  FilePairTrend,
  HistoryStats,
  ListReportsParams,
  MappingPreviewResponse,
  MatchRateBucket,
  Report,
  ReportDetail,
  ReportRow,
  ReportTag,
  ReportsSummary,
  ReportsTrend,
  RulePreviewInput,
  RulePreviewResponse,
  RunReconciliationInput,
  TopFilePair,
  TransactionDetail,
  TransactionListParams,
  TransactionsResponse,
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
  return apiFetch.get<ReportDetail>(`/reports/${id}`)
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

export function updateName(id: string, name: string) {
  return apiFetch.patch<Report>(`/reports/${id}/name`, { name })
}

export function addFavorite(id: string) {
  return apiFetch.put<void>(`/reports/${id}/favorite`)
}

export function removeFavorite(id: string) {
  return apiFetch.del<void>(`/reports/${id}/favorite`)
}

export function createDraft(input?: DraftInput) {
  return apiFetch.post<Report>('/reports/draft', input)
}

export function updateDraft(id: string, input: DraftInput) {
  return apiFetch.patch<Report>(`/reports/draft/${id}`, input)
}

export function getMappingPreview(id: string) {
  return apiFetch.post<MappingPreviewResponse>(`/reports/${id}/mapping-preview`)
}

export function getRulePreview(id: string, input: RulePreviewInput) {
  return apiFetch.post<RulePreviewResponse>(`/reports/${id}/rule-preview`, input)
}

export function runReconciliation(id: string, input: RunReconciliationInput) {
  return apiFetch.post<{ id: string }>(`/reports/${id}/run`, input)
}

export function getTransactions(id: string, params?: TransactionListParams) {
  return apiFetch.get<TransactionsResponse>(`/reports/${id}/transactions`, {
    query: {
      search: params?.search,
      status: params?.status,
      amountMin: params?.amountMin,
      amountMax: params?.amountMax,
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo,
      sortBy: params?.sortBy,
      sortDir: params?.sortDir,
      limit: params?.limit,
      offset: params?.offset,
    },
  })
}

export function getTransaction(id: string, rowId: string) {
  return apiFetch.get<TransactionDetail>(`/reports/${id}/transactions/${rowId}`)
}

export function markRowReviewed(id: string, rowId: string, reviewed = true) {
  return apiFetch.patch<ReportRow>(`/reports/${id}/transactions/${rowId}/review`, { reviewed })
}

export function getBreakBreakdown(id: string) {
  return apiFetch.get<BreakBreakdownItem[]>(`/reports/${id}/break-breakdown`)
}

export function getFilePairTrend(id: string) {
  return apiFetch.get<FilePairTrend>(`/reports/${id}/trend`)
}
