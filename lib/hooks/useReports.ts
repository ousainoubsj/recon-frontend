import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as reportsApi from '@/lib/api/reports'
import { toastApiError } from '@/lib/toast'
import type { BulkExportInput, ListReportsParams, ReportTag } from '@/types/reports'

export const reportKeys = {
  summary: ['reports', 'summary'] as const,
  trend: (months?: number) => ['reports', 'trend', months ?? null] as const,
  list: (params?: ListReportsParams) => ['reports', 'list', params ?? {}] as const,
  detail: (id: string) => ['reports', 'detail', id] as const,
  historyStats: ['reports', 'historyStats'] as const,
  matchRateDistribution: ['reports', 'matchRateDistribution'] as const,
  topFilePairs: ['reports', 'topFilePairs'] as const,
  drafts: ['reports', 'drafts'] as const,
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

export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: reportKeys.detail(id ?? ''),
    queryFn: async () => {
      try {
        return await reportsApi.getById(id as string)
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
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    },
    onError: (err) => toastApiError(err, 'Failed to update tag'),
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isFavorited }: { id: string; isFavorited: boolean }) =>
      isFavorited ? reportsApi.removeFavorite(id) : reportsApi.addFavorite(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] }),
    onError: (err) => toastApiError(err, 'Failed to update favorite'),
  })
}

export function useBulkDeleteReports() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => reportsApi.bulkDelete(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
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
