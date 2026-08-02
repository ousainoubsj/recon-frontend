import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import * as reportsApi from '@/lib/api/reports'
import { ApiError } from '@/lib/api/client'
import { toastApiError } from '@/lib/toast'
import type {
  BulkExportInput,
  CreateScheduleInput,
  DraftInput,
  EmailReportInput,
  ExportReportInput,
  ListExportsParams,
  ListReportsParams,
  ReportTag,
  RulePreviewInput,
  RunReconciliationInput,
  TransactionListParams,
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
        return await reportsApi.getSummary()
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
        return await reportsApi.getTrend(months)
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
        return await reportsApi.list(params)
      } catch (err) {
        toastApiError(err, 'Failed to load reports')
        throw err
      }
    },
  })
}

export function useReport(id: string | undefined, options?: { preview?: boolean }) {
  return useQuery({
    queryKey: reportKeys.detail(id ?? ''),
    queryFn: async () => {
      try {
        return await reportsApi.getById(id as string, { preview: options?.preview })
      } catch (err) {
        toastApiError(err, 'Failed to load reconciliation')
        throw err
      }
    },
    enabled: !!id,
  })
}

export function useHistoryStats() {
  return useQuery({
    queryKey: reportKeys.historyStats,
    queryFn: async () => {
      try {
        return await reportsApi.getHistoryStats()
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
        return await reportsApi.getMatchRateDistribution()
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
        return await reportsApi.getTopFilePairs()
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
        return await reportsApi.listDrafts()
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
    mutationFn: ({ id, tag }: { id: string; tag: ReportTag | null }) => reportsApi.updateTag(id, tag),
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
    mutationFn: ({ id, name }: { id: string; name: string }) => reportsApi.updateName(id, name),
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
      isFavorited ? reportsApi.removeFavorite(id) : reportsApi.addFavorite(id),
    onSuccess: () => invalidateReportLists(queryClient),
    onError: (err) => toastApiError(err, 'Failed to update favorite'),
  })
}

export function useBulkDeleteReports() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => reportsApi.bulkDelete(ids),
    onSuccess: () => {
      invalidateReportLists(queryClient)
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
    onError: (err) => toastApiError(err, 'Failed to delete reconciliations'),
  })
}

export function useBulkExportReports() {
  return useMutation({
    mutationFn: (input: BulkExportInput) => reportsApi.bulkExport(input),
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
    mutationFn: (input?: DraftInput) => reportsApi.createDraft(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportKeys.drafts }),
    onError: (err) => toastApiError(err, 'Failed to create draft'),
  })
}

export function useUpdateDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DraftInput }) => reportsApi.updateDraft(id, input),
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
        return await reportsApi.getMappingPreview(id as string)
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
    mutationFn: ({ id, input }: { id: string; input: RulePreviewInput }) => reportsApi.getRulePreview(id, input),
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
    mutationFn: ({ id, input }: { id: string; input: RunReconciliationInput }) => reportsApi.runReconciliation(id, input),
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
        return await reportsApi.getTransactions(id as string, params)
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
        return await reportsApi.getTransaction(id as string, rowId as string)
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
    mutationFn: ({ id, rowId, reviewed }: { id: string; rowId: string; reviewed?: boolean }) =>
      reportsApi.markRowReviewed(id, rowId, reviewed),
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
        return await reportsApi.getBreakBreakdown(id as string)
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
        return await reportsApi.getFilePairTrend(id as string, scope, limit)
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
        return await reportsApi.listExports(params)
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
    mutationFn: ({ id, input }: { id: string; input: ExportReportInput }) => reportsApi.exportReport(id, input),
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
    mutationFn: ({ id, input }: { id: string; input: ExportReportInput }) => reportsApi.exportReport(id, input),
    onError: (err) => toastApiError(err, 'Failed to load report preview'),
  })
}

export function useCreateSchedule() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateScheduleInput }) => reportsApi.createSchedule(id, input),
    onError: (err) => toastApiError(err, 'Failed to schedule report'),
  })
}

export function useEmailReport() {
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmailReportInput }) => reportsApi.emailReport(id, input),
    onError: (err) => toastApiError(err, 'Failed to send report'),
  })
}

// Re-downloads an existing export row — the backend serves the file it
// already persisted to R2 when it was first generated, rather than
// regenerating (and recording a duplicate row) the way useExportReport does.
export function useDownloadExport() {
  return useMutation({
    mutationFn: (exportId: string) => reportsApi.downloadExport(exportId),
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
    mutationFn: (exportId: string) => reportsApi.deleteExport(exportId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports', 'exports'] }),
    onError: (err) => toastApiError(err, 'Failed to delete export'),
  })
}
