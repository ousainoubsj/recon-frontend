import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '@/lib/axios'
import { toastApiError } from '@/lib/toast'
import type { AuditLog, AuditLogStats, ListAuditLogsParams, TopAction, TopUser } from '@/types/auditLogs'

export const auditLogKeys = {
  list: (params?: ListAuditLogsParams) => ['auditLogs', 'list', params ?? {}] as const,
  stats: ['auditLogs', 'stats'] as const,
  topActions: ['auditLogs', 'topActions'] as const,
  topUsers: ['auditLogs', 'topUsers'] as const,
}

export function useAuditLogs(params?: ListAuditLogsParams) {
  return useQuery({
    queryKey: auditLogKeys.list(params),
    queryFn: async () => {
      try {
        const res = await axiosInstance.get<AuditLog[]>('/audit-logs', {
          params: {
            limit: params?.limit,
            offset: params?.offset,
            q: params?.q,
            action: params?.action,
            entityType: params?.entityType,
            userId: params?.userId,
            dateFrom: params?.dateFrom,
            dateTo: params?.dateTo,
            status: params?.status,
          },
        })
        return res.data
      } catch (err) {
        toastApiError(err, 'Failed to load activity')
        throw err
      }
    },
  })
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: auditLogKeys.stats,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<AuditLogStats>('/audit-logs/stats')).data
      } catch (err) {
        toastApiError(err, 'Failed to load audit log stats')
        throw err
      }
    },
  })
}

export function useTopActions() {
  return useQuery({
    queryKey: auditLogKeys.topActions,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<TopAction[]>('/audit-logs/top-actions')).data
      } catch (err) {
        toastApiError(err, 'Failed to load top actions')
        throw err
      }
    },
  })
}

export function useTopUsers() {
  return useQuery({
    queryKey: auditLogKeys.topUsers,
    queryFn: async () => {
      try {
        return (await axiosInstance.get<TopUser[]>('/audit-logs/top-users')).data
      } catch (err) {
        toastApiError(err, 'Failed to load top users')
        throw err
      }
    },
  })
}
