export type AuditLogStatus = 'success' | 'info' | 'warning' | 'failed'

// Matches recon-backend's AuditLog model, joined with the acting user's
// name/email — user is nullable since AuditLog.userId is SetNull on user
// deletion (the log survives with an orphaned/null actor).
export type AuditLog = {
  id: string
  userId: string | null
  organizationId: string | null
  action: string
  entityType: string | null
  entityId: string | null
  status: AuditLogStatus
  ip: string | null
  ts: string
  metadata: Record<string, unknown> | null
  user: { name: string; email: string; image: string | null } | null
}

export type ListAuditLogsParams = {
  limit?: number
  offset?: number
  q?: string
  action?: string | string[]
  entityType?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  status?: AuditLogStatus
}

export type AuditLogStats = {
  total: number
  uniqueUsers: number
  byStatus: Record<AuditLogStatus, number>
  // null when there's no prior-30-day activity to compare against yet.
  totalTrendPercent: number | null
  uniqueUsersTrend: number
}

export type TopAction = { label: string; count: number }
export type TopUser = { name: string; count: number }
