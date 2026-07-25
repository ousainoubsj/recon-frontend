import { useQuery } from '@tanstack/react-query'
import * as auditLogsApi from '@/lib/api/auditLogs'
import { toastApiError } from '@/lib/toast'
import type { ListAuditLogsParams } from '@/types/auditLogs'

export const auditLogKeys = {
  list: (params?: ListAuditLogsParams) => ['auditLogs', 'list', params ?? {}] as const,
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
