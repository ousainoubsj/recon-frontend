import type { ColumnMapping, CompleteColumnMapping, RuleConfig } from './wizard'

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

export type FileSummary = {
  rows: number
  columns: number
  fileSizeBytes: number
}

// Per-status dollar sums (Results' Matched/Unmatched/Duplicates stat tiles
// each show a count + a value) — computed once at completion time.
export type ValueBreakdown = {
  matchedValue: number
  unmatchedValue: number
  duplicateValue: number
}

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
  // Wizard-only fields — null until the corresponding step has happened.
  fileAKey: string | null
  fileBKey: string | null
  columnMapping: ColumnMapping | null
  config: RuleConfig | null
  // Populated at mapping-preview time; unlike the sample-rows cache these
  // survive completion, so Results can still show them.
  fileASummary: FileSummary | null
  fileBSummary: FileSummary | null
  // Only populated once a run actually completes.
  valueBreakdown: ValueBreakdown | null
}

// GET /reports/:id — the single-report fetch used throughout the wizard,
// results, and explorer. A superset of Report: full row data plus a
// derived "vs prior run" comparison from the most recent completed report
// sharing this file pair (null if there's no such prior run).
export type ReportDetail = Report & {
  rows: ReportRow[]
  priorRun: { matchRate: number; totalBreakValue: number } | null
  // Derived from the report.run.started/report.run.completed audit-log
  // pair, not a persisted column — null for anything but a completed report
  // (or a completed one with no matching audit entries for some reason).
  runDurationMs: number | null
}

// Raw ReportRow shape (Prisma field names) — returned by GET /reports/:id
// (via `rows`) and by the review-mutation endpoint. Distinct from
// TransactionListItem/TransactionDetail below, which are the same
// underlying rows reshaped for display by the transactions endpoints.
export type ReportRow = {
  id: string
  reportId: string
  ref: string
  status: 'matched' | 'mismatched' | 'unmatched_a' | 'unmatched_b' | 'duplicate'
  amountA: number | null
  amountB: number | null
  amountDiff: number | null
  dateA: string | null
  dateB: string | null
  rawA: Record<string, string> | null
  rawB: Record<string, string> | null
  breakReason: string | null
  reviewed: boolean
  reviewedBy: string | null
  reviewedAt: string | null
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

// POST /reports/draft (create) and PATCH /reports/draft/:id (update) share
// this shape — every field optional, patchable incrementally as the wizard
// progresses (upload file A, then B, then mapping, then rules...).
export type DraftInput = Partial<{
  name: string
  fileAName: string
  fileBName: string
  progress: number
  config: Record<string, unknown>
  fileAKey: string
  fileBKey: string
  columnMapping: ColumnMapping
}>

export type MappingPreviewFile = {
  filename: string | null
  rows: number
  columns: number
  fileSizeBytes: number
  previewRows: Record<string, string>[]
  mappings: { field: 'referenceNumber' | 'amount' | 'transactionDate' | 'currency'; label: string; value: string | null; confidence: number }[]
  missingValues: { count: number; percent: number }
  duplicateReferences: { count: number; percent: number }
}

export type MappingPreviewResponse = {
  fileA: MappingPreviewFile
  fileB: MappingPreviewFile
}

export type RulePreviewInput = {
  columnMapping?: ColumnMapping
  config: RuleConfig
}

export type RulePreviewResponse = {
  estimatedMatches: number
  possibleMismatches: number
  potentialDuplicates: number
  missingReferences: number
}

export type RunReconciliationInput = {
  name?: string
  columnMapping: CompleteColumnMapping
  config: RuleConfig
}

export type TransactionRowStatus = 'Matched' | 'Mismatched' | 'Unmatched' | 'Duplicate'

// GET /reports/:id/transactions — each row reshaped for display (as
// opposed to ReportRow's raw Prisma field names above).
export type TransactionListItem = {
  id: string
  status: TransactionRowStatus
  reference: string
  date: string | null
  description: string
  ledgerAmount: number | null
  counterpartyAmount: number | null
  difference: number | null
  hasDifference: boolean
  reviewed: boolean
  type: string
  reason: string
}

export type TransactionsResponse = {
  rows: TransactionListItem[]
  total: number
}

export type TransactionListParams = {
  search?: string
  status?: 'matched' | 'mismatched' | 'unmatched' | 'duplicate'
  amountMin?: number
  amountMax?: number
  dateFrom?: string
  dateTo?: string
  sortBy?: 'date' | 'amount' | 'reference'
  sortDir?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export type TransactionDetail = TransactionListItem & {
  rawA: Record<string, string> | null
  rawB: Record<string, string> | null
  matchAnalysis: { text: string; passed: boolean }[]
  recommendedAction: string
}

export type BreakBreakdownItem = {
  category: string
  amount: number
  percent: number
}

export type FilePairTrend = {
  matchRateTrend: { current: number[]; prior: number[] }
  breakValueTrend: { current: number[]; prior: number[] }
}
