import { useQuery } from '@tanstack/react-query'
import * as reportsApi from '@/lib/api/reports'
import { toastApiError } from '@/lib/toast'
import type { ListReportsParams } from '@/types/reports'

export const reportKeys = {
  summary: ['reports', 'summary'] as const,
  trend: (months?: number) => ['reports', 'trend', months ?? null] as const,
  list: (params?: ListReportsParams) => ['reports', 'list', params ?? {}] as const,
  detail: (id: string) => ['reports', 'detail', id] as const,
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
