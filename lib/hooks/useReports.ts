import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { axiosInstance, ApiError } from '@/lib/axios'
import { toast, toastApiError } from '@/lib/toast'
import type {
  BreakBreakdownItem,
  BulkExportInput,
  DraftInput,
  EmailReportInput,
  ExportReportInput,
  FilePairTrend,
  HistoryStats,
  ListExportsParams,
  ListReportsParams,
  MappingPreviewResponse,
  MatchRateBucket,
  Report,
  ReportDetail,
  ReportExport,
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

// A blanket ['reports'] invalidation matches every key under that prefix,
// including `mappingPreview` — a one-shot draft-priming query (staleTime:
// Infinity, 404s once the report is no longer a draft/failed run). Forcing
// it to refetch here would hit the backend right as a report transitions to
// 'completed', throwing a spurious NotFoundError. Excluded everywhere a
// reports-list refresh is triggered, not just where this was first noticed.
function invalidateReportLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    queryKey: ['reports'],
    predicate: (query) => query.queryKey[1] !== 'mappingPreview',
  })
}

// Shared by the 3 endpoints that stream a binary file instead of JSON
// (bulk-export, export, download) — resolves the raw Blob plus whatever
// filename the server suggested via Content-Disposition.
function filenameFromHeaders(headers: Record<string, unknown>): string {
  const disposition = String(headers['content-disposition'] ?? '')
  return /filename="?([^"]+)"?/.exec(disposition)?.[1] ?? 'download'
}

export const reportKeys = {
  summary: ['reports', 'summary'] as const,
  trend: (months?: number) => ['reports', 'trend', months ?? null] as const,
  list: (params?: ListReportsParams) => ['reports', 'list', params ?? {}] as const,
  detail: (id: string) => ['reports', 'detail', id] as const,
  historyStats: ['reports', 'historyStats'] as const,
  matchRateDistribution: ['reports', 'matchRateDistribution'] as const,
  topFilePairs: ['reports', 'topFilePairs'] as const,
  drafts: ['reports', 'drafts'] as const,
  mappingPreview: (id: string) => ['reports', 'mappingPreview', id] as const,
  transactions: (id: string, params?: TransactionListParams) => ['reports', 'transactions', id, params ?? {}] as const,
  transaction: (id: string, rowId: string) => ['reports', 'transaction', id, rowId] as const,
  breakBreakdown: (id: string) => ['reports', 'breakBreakdown', id] as const,
  filePairTrend: (id: string, scope: 'filePair' | 'overall' = 'filePair', limit = 7) =>
    ['reports', 'filePairTrend', id, scope, limit] as const,
  exports: (params?: ListExportsParams) => ['reports', 'exports', params ?? {}] as const,
}

export function useReportsSummary() {
  return useQuery({
    queryKey: reportKeys.summary,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<ReportsSummary>('/reports/summary')).data
      } catch (err) {
        toastApiError(err, 'Failed to load reconciliation summary')
        throw err
      }
    },
  })
}

export function useReportsTrend(months?: number) {
  return useQuery({
    queryKey: reportKeys.trend(months),
    queryFn: async () => {
      try {
        return (await axiosInstance.get<ReportsTrend>('/reports/trend', { params: { months } })).data
      } catch (err) {
        toastApiError(err, 'Failed to load reconciliation trend')
        throw err
      }
    },
  })
}

export function useReports(params?: ListReportsParams) {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: async () => {
      try {
        const res = await axiosInstance.get<Report[]>('/reports', {
          params: {
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
        return res.data
      } catch (err) {
        toastApiError(err, 'Failed to load reports')
        throw err
      }
    },
  })
}

// `silent` skips the error toast and retry — for best-effort lookups where a
// 404 is an expected outcome, not a failure (e.g. AuditSidebar previewing
// whatever report a historical audit-log entry points to, which may have
// since been deleted while the log entry itself persists).
export function useReport(id: string | undefined, options?: { preview?: boolean; silent?: boolean }) {
  return useQuery({
    queryKey: reportKeys.detail(id ?? ''),
    queryFn: async () => {
      try {
        const res = await axiosInstance.get<ReportDetail>(`/reports/${id}`, { params: { preview: options?.preview } })
        return res.data
      } catch (err) {
        if (!options?.silent) toastApiError(err, 'Failed to load reconciliation')
        throw err
      }
    },
    enabled: !!id,
    retry: options?.silent ? false : undefined,
  })
}

export function useHistoryStats() {
  return useQuery({
    queryKey: reportKeys.historyStats,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<HistoryStats>('/reports/history-stats')).data
      } catch (err) {
        toastApiError(err, 'Failed to load history stats')
        throw err
      }
    },
  })
}

export function useMatchRateDistribution() {
  return useQuery({
    queryKey: reportKeys.matchRateDistribution,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<MatchRateBucket[]>('/reports/match-rate-distribution')).data
      } catch (err) {
        toastApiError(err, 'Failed to load match rate distribution')
        throw err
      }
    },
  })
}

export function useTopFilePairs() {
  return useQuery({
    queryKey: reportKeys.topFilePairs,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<TopFilePair[]>('/reports/top-file-pairs')).data
      } catch (err) {
        toastApiError(err, 'Failed to load top file pairs')
        throw err
      }
    },
  })
}

export function useDrafts() {
  return useQuery({
    queryKey: reportKeys.drafts,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<Report[]>('/reports/drafts')).data
      } catch (err) {
        toastApiError(err, 'Failed to load drafts')
        throw err
      }
    },
  })
}

export function useUpdateReportTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, tag }: { id: string; tag: ReportTag | null }) =>
      (await axiosInstance.patch<Report>(`/reports/${id}/tag`, { tag })).data,
    onSuccess: () => {
      invalidateReportLists(queryClient)
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
    onError: (err) => toastApiError(err, 'Failed to update tag'),
  })
}

export function useUpdateReportName() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      (await axiosInstance.patch<Report>(`/reports/${id}/name`, { name })).data,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      invalidateReportLists(queryClient)
    },
    onError: (err) => toastApiError(err, 'Failed to rename reconciliation'),
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isFavorited }: { id: string; isFavorited: boolean }) =>
      isFavorited ? axiosInstance.delete<void>(`/reports/${id}/favorite`) : axiosInstance.put<void>(`/reports/${id}/favorite`),
    onSuccess: () => invalidateReportLists(queryClient),
    onError: (err) => toastApiError(err, 'Failed to update favorite'),
  })
}

export function useDeleteReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => (await axiosInstance.delete<void>(`/reports/${id}`)).data,
    onSuccess: () => {
      invalidateReportLists(queryClient)
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
      toast.success('Reconciliation deleted')
    },
    onError: (err) => toastApiError(err, 'Failed to delete reconciliation'),
  })
}

export function useBulkDeleteReports() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => (await axiosInstance.post<{ deletedCount: number }>('/reports/bulk-delete', { ids })).data,
    onSuccess: (data) => {
      invalidateReportLists(queryClient)
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
      toast.success(data.deletedCount === 1 ? 'Reconciliation deleted' : `${data.deletedCount} reconciliations deleted`)
    },
    onError: (err) => toastApiError(err, 'Failed to delete reconciliations'),
  })
}

export function useBulkExportReports() {
  return useMutation({
    mutationFn: async (input: BulkExportInput) => {
      const res = await axiosInstance.post<Blob>('/reports/bulk-export', input, { responseType: 'blob' })
      return { blob: res.data, filename: filenameFromHeaders(res.headers) }
    },
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    onError: (err) => {
      toastApiError(err, 'Failed to export reconciliations')
    },
  })
}

export function useCreateDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input?: DraftInput) => (await axiosInstance.post<Report>('/reports/draft', input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportKeys.drafts }),
    onError: (err) => toastApiError(err, 'Failed to create draft'),
  })
}

export function useUpdateDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: DraftInput }) =>
      (await axiosInstance.patch<Report>(`/reports/draft/${id}`, input)).data,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: reportKeys.drafts })
    },
    onError: (err) => toastApiError(err, 'Failed to save draft'),
  })
}

// A query, not a mutation — this is "give me the mapping preview for this
// report", cached per reportId. It does have a server-side side effect
// (caches sample rows + a suggested mapping) but re-deriving it on every
// remount would just re-parse the files for no benefit, so it's treated as
// stable data for the lifetime of the wizard session.
export function useMappingPreview(id: string | undefined) {
  return useQuery({
    queryKey: reportKeys.mappingPreview(id ?? ''),
    queryFn: async () => {
      try {
        return (await axiosInstance.post<MappingPreviewResponse>(`/reports/${id}/mapping-preview`)).data
      } catch (err) {
        toastApiError(err, 'Failed to preview column mapping')
        throw err
      }
    },
    enabled: !!id,
    staleTime: Infinity,
  })
}

// A mutation, not a query — called imperatively (debounced) as the rule
// sliders move, each call with a different config. Caching by config value
// would just churn the query cache for no benefit.
export function useRulePreview() {
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: RulePreviewInput }) =>
      (await axiosInstance.post<RulePreviewResponse>(`/reports/${id}/rule-preview`, input)).data,
    onError: (err) => {
      // A 404 here just means this debounced preview call landed after the
      // draft already finished running (or was deleted) — the draft is gone
      // by the time the request reaches the backend, not a real failure
      // worth alarming the user about.
      if (err instanceof ApiError && err.status === 404) return
      toastApiError(err, 'Failed to preview matching rules')
    },
  })
}

export function useRunReconciliation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: RunReconciliationInput }) =>
      (await axiosInstance.post<{ id: string }>(`/reports/${id}/run`, input)).data,
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
      invalidateReportLists(queryClient)
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
    // Also invalidate on failure, not just success — the backend persists
    // the real failure reason onto Report.errorMessage, and the wizard's
    // inline retry banner reads it straight off useReport(reportId). Without
    // this, that query stays on its pre-run cached data (errorMessage still
    // null) and the banner falls back to a generic message forever.
    onError: (_err, { id }) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.detail(id) })
    },
    // Deliberately no toast here — a failed run is shown inline as a
    // retryable error state in the wizard, not a transient toast.
  })
}

export function useTransactions(id: string | undefined, params?: TransactionListParams) {
  return useQuery({
    queryKey: reportKeys.transactions(id ?? '', params),
    queryFn: async () => {
      try {
        const res = await axiosInstance.get<TransactionsResponse>(`/reports/${id}/transactions`, {
          params: {
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
        return res.data
      } catch (err) {
        toastApiError(err, 'Failed to load transactions')
        throw err
      }
    },
    enabled: !!id,
  })
}

export function useTransaction(id: string | undefined, rowId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.transaction(id ?? '', rowId ?? ''),
    queryFn: async () => {
      try {
        return (await axiosInstance.get<TransactionDetail>(`/reports/${id}/transactions/${rowId}`)).data
      } catch (err) {
        toastApiError(err, 'Failed to load transaction details')
        throw err
      }
    },
    enabled: !!id && !!rowId,
  })
}

export function useMarkRowReviewed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, rowId, reviewed = true }: { id: string; rowId: string; reviewed?: boolean }) =>
      (await axiosInstance.patch<ReportRow>(`/reports/${id}/transactions/${rowId}/review`, { reviewed })).data,
    onSuccess: (_data, { id, rowId }) => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'transactions', id] })
      queryClient.invalidateQueries({ queryKey: reportKeys.transaction(id, rowId) })
    },
    onError: (err) => toastApiError(err, 'Failed to update review status'),
  })
}

export function useBreakBreakdown(id: string | undefined) {
  return useQuery({
    queryKey: reportKeys.breakBreakdown(id ?? ''),
    queryFn: async () => {
      try {
        return (await axiosInstance.get<BreakBreakdownItem[]>(`/reports/${id}/break-breakdown`)).data
      } catch (err) {
        toastApiError(err, 'Failed to load break breakdown')
        throw err
      }
    },
    enabled: !!id,
  })
}

export function useFilePairTrend(id: string | undefined, scope: 'filePair' | 'overall' = 'filePair', limit = 7) {
  return useQuery({
    queryKey: reportKeys.filePairTrend(id ?? '', scope, limit),
    queryFn: async () => {
      try {
        const res = await axiosInstance.get<FilePairTrend>(`/reports/${id}/trend`, { params: { scope, limit } })
        return res.data
      } catch (err) {
        toastApiError(err, 'Failed to load trend')
        throw err
      }
    },
    enabled: !!id,
  })
}

export function useExports(params?: ListExportsParams) {
  return useQuery({
    queryKey: reportKeys.exports(params),
    queryFn: async () => {
      try {
        const res = await axiosInstance.get<ReportExport[]>('/reports/exports', {
          params: { limit: params?.limit, offset: params?.offset, q: params?.q },
        })
        return res.data
      } catch (err) {
        toastApiError(err, 'Failed to load recent exports')
        throw err
      }
    },
  })
}

// Deliberately doesn't invalidate the exports list itself — this same
// mutation backs both "Generate Report" (a genuinely new export, where the
// caller should invalidate via mutate's per-call onSuccess) and
// RecentExports' row-level re-download (regenerating a file that has no
// stored copy to fetch, per ReportExport having no storage key — see
// docs/frontend-wiring-plan.md's Phase 8 notes). Auto-invalidating here
// would make every re-download of an existing row appear to spawn a
// duplicate "just created" row in the same table.
export function useExportReport() {
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ExportReportInput }) => {
      const res = await axiosInstance.post<Blob>(`/reports/${id}/export`, input, { responseType: 'blob' })
      return { blob: res.data, filename: filenameFromHeaders(res.headers) }
    },
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    onError: (err) => toastApiError(err, 'Failed to export reconciliation'),
  })
}

// Same endpoint as useExportReport, but the caller manages the resulting
// blob itself (e.g. as an <iframe> preview) instead of triggering a
// download — pass `preview: true` in the input so the backend skips
// tracking it as a real export.
export function usePreviewReport() {
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ExportReportInput }) => {
      const res = await axiosInstance.post<Blob>(`/reports/${id}/export`, input, { responseType: 'blob' })
      return { blob: res.data, filename: filenameFromHeaders(res.headers) }
    },
    onError: (err) => toastApiError(err, 'Failed to load report preview'),
  })
}

export function useEmailReport() {
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: EmailReportInput }) =>
      (await axiosInstance.post<{ sent: boolean; reason?: string }>(`/reports/${id}/email`, input)).data,
    onSuccess: (data) => (data.sent ? toast.success('Report sent') : toast.error(data.reason ?? 'Report not sent')),
    onError: (err) => toastApiError(err, 'Failed to send report'),
  })
}

// Re-downloads an existing export row — the backend serves the file it
// already persisted to R2 when it was first generated, rather than
// regenerating (and recording a duplicate row) the way useExportReport does.
export function useDownloadExport() {
  return useMutation({
    mutationFn: async (exportId: string) => {
      const res = await axiosInstance.get<Blob>(`/reports/exports/${exportId}/download`, { responseType: 'blob' })
      return { blob: res.data, filename: filenameFromHeaders(res.headers) }
    },
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    onError: (err) => toastApiError(err, 'Failed to download export'),
  })
}

export function useDeleteExport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (exportId: string) => axiosInstance.delete<void>(`/reports/exports/${exportId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports', 'exports'] }),
    onError: (err) => toastApiError(err, 'Failed to delete export'),
  })
}
