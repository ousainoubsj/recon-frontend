import { apiFetch } from './client'
import type { AuditLog, ListAuditLogsParams } from '@/types/auditLogs'

export function list(params?: ListAuditLogsParams) {
  return apiFetch.get<AuditLog[]>('/audit-logs', {
    query: {
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
}
