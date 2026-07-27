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
  // Formatted display ID (REC-YYYY-NNNNNN via formatReportReference) is only
  // meaningful once a report has actually completed at least once — null on
  // drafts and never-completed failed runs.
  sequenceYear: number | null
  sequenceNumber: number | null
}

export type ListReportsParams = {
  limit?: number
  offset?: number
  q?: string
  dateFrom?: string
  dateTo?: string
  tag?: ReportTag
  favoritesOnly?: boolean
  // History includes both completed and failed runs by default (drafts
  // never appear) — narrow to just one with this.
  status?: 'completed' | 'failed'
}

// History's 4 stat tiles — an all-time cumulative value plus a rolling
// 30-vs-prior-30-day trend, a different shape from ReportSummaryMetric's
// current/previous/deltaPercent (that one's calendar-month based, this one
// isn't).
export type ReportHistoryMetric = {
  value: number
  deltaPercent: number | null
}

export type HistoryStats = {
  totalReconciliations: ReportHistoryMetric
  avgMatchRate: ReportHistoryMetric
  totalBreakValue: ReportHistoryMetric
  totalTransactions: ReportHistoryMetric
}

export type MatchRateBucket = {
  label: string
  value: number
  percent: string
}

export type TopFilePair = {
  label: string
  count: number
}

export type BulkExportFormat = 'xlsx' | 'pdf'

export type BulkExportInput = {
  ids: string[]
  format?: BulkExportFormat
  templateId?: string
  sections?: Partial<{
    summary: boolean
    matchStatistics: boolean
    breakAnalysis: boolean
    unmatchedDetails: boolean
    chartsAndGraphs: boolean
  }>
}
