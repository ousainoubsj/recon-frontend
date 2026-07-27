import { apiFetch } from './client'
import type { AuditLog, AuditLogStats, ListAuditLogsParams, TopAction, TopUser } from '@/types/auditLogs'

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

export function getStats() {
  return apiFetch.get<AuditLogStats>('/audit-logs/stats')
}

export function getTopActions() {
  return apiFetch.get<TopAction[]>('/audit-logs/top-actions')
}

export function getTopUsers() {
  return apiFetch.get<TopUser[]>('/audit-logs/top-users')
}
