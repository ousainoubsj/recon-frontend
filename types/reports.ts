export type ReportSummaryMetric = {
  current: number
  previous: number
  deltaPercent: number | null
}

export type ReportsSummary = {
  totalReconciliations: ReportSummaryMetric
  avgMatchRate: ReportSummaryMetric
  unmatchedTransactions: ReportSummaryMetric
  totalBreakValue: ReportSummaryMetric
  totalTransactions: number
}

export type ReportsTrend = {
  matchRateSeries: { month: string; value: number }[]
  volumeSeries: { month: string; value: number }[]
  categoryBreakdown: {
    matched: number
    mismatched: number
    unmatched: number
    duplicates: number
  }
}

export type ReportTag = 'bank' | 'supplier' | 'year_end'
export type ReportStatus = 'draft' | 'completed' | 'failed'

// Matches recon-backend's Report model as serialized over JSON — Decimal
// fields (totalBreakValue, amountTolerance) come back as strings, not
// numbers (Prisma's Decimal.toJSON()).
export type Report = {
  id: string
  userId: string
  organizationId: string
  status: ReportStatus
  errorMessage: string | null
  fileAName: string | null
  fileBName: string | null
  name: string | null
  tag: ReportTag | null
  progress: number
  runDate: string
  updatedAt: string
  totalRows: number
  matchedCount: number
  unmatchedCount: number
  mismatchedCount: number
  duplicateCount: number
  totalBreakValue: string
  amountTolerance: string
  dateToleranceDays: number | null
  isFavorited: boolean
}

export type ListReportsParams = {
  limit?: number
  offset?: number
  q?: string
  dateFrom?: string
  dateTo?: string
  tag?: ReportTag
  favoritesOnly?: boolean
}
