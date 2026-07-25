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
  user: { name: string; email: string } | null
}

export type ListAuditLogsParams = {
  limit?: number
  offset?: number
  q?: string
  action?: string
  entityType?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  status?: AuditLogStatus
}
