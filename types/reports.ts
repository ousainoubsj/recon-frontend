import type { ColumnMapping, CompleteColumnMapping, RuleConfig } from './wizard'

// `current` is an all-time total; `previous`/`deltaPercent` still compare
// this calendar month against last, so deltaPercent reflects recent trend
// even though `current` itself isn't scoped to the current month.
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
// 'processing' is set for the duration of a background reconciliation run
// (executed by a BullMQ worker, decoupled from the /run request) — see
// ReconciliationWizard.tsx / useReport's polling while a report sits in
// this state.
export type ReportStatus = 'draft' | 'processing' | 'completed' | 'failed'

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
  // The completed rerun that replaced this report; dashboards then count that one instead. Null while current.
  supersededBy: { id: string; reference: string | null } | null
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
  // The completed report this one was rerun from; null for a first run, or once that source is deleted.
  rerunOf: { id: string; name: string | null; reference: string | null } | null
  // Shown beside the engine's figures, never folded into them: matchedCount and the match rate don't change.
  resolutionSummary: { resolvedCount: number; unresolvedExceptionCount: number }
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
// current/previous/deltaPercent (both are all-time totals with a trend
// delta, but this one's window is a rolling 30 days rather than calendar
// month).
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

// Matches the backend's sectionsSchema (recon-backend/routes/reports.js)
// exactly — shared by bulk export and single-report export.
export type ReportSections = Partial<{
  summary: boolean
  matchStatistics: boolean
  breakAnalysis: boolean
  unmatchedDetails: boolean
  chartsAndGraphs: boolean
}>

export type BulkExportInput = {
  ids: string[]
  format?: BulkExportFormat
  templateId?: string
  sections?: ReportSections
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
  resolution: { id: string; kind: ResolutionKind } | null
}

export type TransactionsResponse = {
  rows: TransactionListItem[]
  total: number
}

export type TransactionListParams = {
  search?: string
  // The explicit sides are for the match picker, which lists only the other file's unmatched rows.
  status?: 'matched' | 'mismatched' | 'unmatched' | 'unmatched_a' | 'unmatched_b' | 'duplicate'
  resolution?: 'resolved' | 'unresolved'
  amountMin?: number
  amountMax?: number
  dateFrom?: string
  dateTo?: string
  sortBy?: 'date' | 'amount' | 'reference'
  sortDir?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export type TransactionDetail = Omit<TransactionListItem, 'resolution'> & {
  rawA: Record<string, string> | null
  rawB: Record<string, string> | null
  matchAnalysis: { text: string; passed: boolean }[]
  recommendedAction: string
  resolution: RowResolution | null
}

// matched: an unmatched internal row paired by hand with an unmatched counterparty row.
// explained: a break accepted with a reason. Neither changes the row's own status or amounts.
export type ResolutionKind = 'matched' | 'explained'

export type RowResolution = {
  id: string
  kind: ResolutionKind
  note: string
  resolvedBy: { id: string; name: string } | null
  resolvedAt: string
  rows: { id: string; reference: string; side: 'A' | 'B' }[]
}

// A match is exactly one internal row and one counterparty row; an explanation covers 1–100 rows.
export type ResolveRowsInput =
  | { kind: 'matched'; rowIds: [string, string]; note: string }
  | { kind: 'explained'; rowIds: string[]; note: string }

export type RerunResult = { id: string }

export type BreakBreakdownItem = {
  category: string
  amount: number
  percent: number
}

export type FilePairTrend = {
  matchRateTrend: { current: number[]; prior: number[] }
  breakValueTrend: { current: number[]; prior: number[] }
  // A dense rank among currently-existing runs matching this trend's scope
  // (same oldest-to-newest order as the trend values above) — 1 is the
  // oldest run that still exists, not a permanent reference number. Always
  // contiguous, recomputed fresh from the full matching history each call,
  // so e.g. "last 7 of 8 total" reads as 2-8, never a gapped number like
  // "12..17" from a deleted earlier run. Deliberately NOT the same as the
  // report's permanent sequenceNumber/reference ID (REC-YYYY-NNNNNN) shown
  // elsewhere — that one never changes once assigned. Shared by both trends
  // above, since they're built from the same underlying runs.
  runLabels: { current: number[]; prior: number[] }
}

// GET/POST /report-templates. System templates (isSystem: true) are shared
// across every org (organizationId: null) and can't be deleted; org-created
// ones are private to that org.
export type ReportTemplate = {
  id: string
  organizationId: string | null
  name: string
  description: string | null
  sections: ReportSections
  isSystem: boolean
  createdAt: string
}

export type ExportReportInput = {
  format: BulkExportFormat
  templateId?: string
  sections?: ReportSections
  // Skips audit-log/R2-persistence/ReportExport tracking server-side — set
  // by ReportPreviewCard's "Preview Full Report" dialog so opening a
  // preview doesn't spawn a phantom row in RecentExports.
  preview?: boolean
}

// POST /reports/comparison-export — the "Combined Report" pseudo-template's
// export. No templateId (it's never a real ReportTemplate row, same as
// Custom Report); `ids` needs 2+ completed reconciliations.
export type ComparisonExportInput = {
  ids: string[]
  format: BulkExportFormat
  sections?: ReportSections
  preview?: boolean
}

// GET /reports/exports — joined with the report/user/template names it was
// generated from and by, for display (RecentExports.tsx).
export type ReportExport = {
  id: string
  reportId: string
  userId: string
  organizationId: string
  templateId: string | null
  source: 'manual'
  format: BulkExportFormat
  status: 'success' | 'failed'
  errorMessage: string | null
  fileSizeBytes: number | null
  createdAt: string
  report: { name: string | null; fileAName: string | null; fileBName: string | null }
  user: { name: string; image: string | null }
  template: { name: string } | null
}

export type ListExportsParams = {
  limit?: number
  offset?: number
  q?: string
}

export type EmailReportInput = {
  to: string[]
}

// POST /reports/comparison-email — Combined Report's email, 2+ reports.
export type ComparisonEmailReportInput = {
  ids: string[]
  to: string[]
}
