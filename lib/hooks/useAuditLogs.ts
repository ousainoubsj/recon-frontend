import { useQuery } from '@tanstack/react-query'
import * as auditLogsApi from '@/lib/api/auditLogs'
import { toastApiError } from '@/lib/toast'
import type { ListAuditLogsParams } from '@/types/auditLogs'

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
        return await auditLogsApi.list(params)
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
        return await auditLogsApi.getStats()
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
        return await auditLogsApi.getTopActions()
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
        return await auditLogsApi.getTopUsers()
      } catch (err) {
        toastApiError(err, 'Failed to load top users')
        throw err
      }
    },
  })
}
