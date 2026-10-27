// Step 3 stand-in for the rerun and resolution endpoints (recon-backend/RERUN_AND_RESOLUTION_PLAN.md).
// Resolutions live in memory for this tab only. Each wired slice deletes its part; the file goes once nothing imports it.
import { axiosInstance, ApiError } from '@/lib/axios'
import type {
  ReportDetail,
  ResolveRowsInput,
  RowResolution,
  TransactionDetail,
  TransactionListParams,
  TransactionsResponse,
} from '@/types/reports'

const resolutionsByReport = new Map<string, RowResolution[]>()

function resolutionsFor(reportId: string) {
  return resolutionsByReport.get(reportId) ?? []
}

function resolutionForRow(reportId: string, rowId: string) {
  return resolutionsFor(reportId).find((resolution) => resolution.rows.some((row) => row.id === rowId)) ?? null
}

function mockApiError(status: number, title: string, detail: string) {
  return new ApiError({ type: 'https://recon.app/errors/mock', title, status, detail })
}

// The explorer shows both unmatched sides as "Unmatched"; only a counterparty-only row has no ledger data.
function sideOf(detail: TransactionDetail): 'A' | 'B' {
  return detail.status === 'Unmatched' && detail.rawA == null ? 'B' : 'A'
}

export async function mockResolveRows(reportId: string, input: ResolveRowsInput): Promise<RowResolution> {
  const details = await Promise.all(
    input.rowIds.map(async (rowId) => (await axiosInstance.get<TransactionDetail>(`/reports/${reportId}/transactions/${rowId}`)).data),
  )

  if (details.some((detail) => resolutionForRow(reportId, detail.id))) {
    throw mockApiError(409, 'ConflictError', 'One of these transactions is already resolved')
  }
  if (details.some((detail) => detail.status === 'Matched')) {
    throw mockApiError(422, 'ValidationError', 'Matched transactions cannot be resolved')
  }
  if (input.kind === 'matched') {
    const sides = details.map(sideOf)
    const isOneOfEachSide = sides.includes('A') && sides.includes('B')
    if (details.some((detail) => detail.status !== 'Unmatched') || !isOneOfEachSide) {
      throw mockApiError(422, 'ValidationError', 'A match pairs one unmatched internal transaction with one unmatched counterparty transaction')
    }
  }

  const resolution: RowResolution = {
    id: crypto.randomUUID(),
    kind: input.kind,
    note: input.note.trim(),
    resolvedBy: { id: 'mock-user', name: 'You' },
    resolvedAt: new Date().toISOString(),
    rows: details.map((detail) => ({ id: detail.id, reference: detail.reference, side: sideOf(detail) })),
  }
  resolutionsByReport.set(reportId, [...resolutionsFor(reportId), resolution])
  return resolution
}

export async function mockUnresolve(reportId: string, resolutionId: string): Promise<void> {
  const remaining = resolutionsFor(reportId).filter((resolution) => resolution.id !== resolutionId)
  if (remaining.length === resolutionsFor(reportId).length) {
    throw mockApiError(404, 'NotFoundError', 'Resolution not found')
  }
  resolutionsByReport.set(reportId, remaining)
}

// The overlays below add the fields the real API will return once Step 5 lands.

export function withMockReportResolution(reportId: string, report: ReportDetail): ReportDetail {
  const resolvedCount = resolutionsFor(reportId).reduce((count, resolution) => count + resolution.rows.length, 0)
  const exceptionCount = report.unmatchedCount + report.mismatchedCount + report.duplicateCount
  return {
    ...report,
    resolutionSummary: { resolvedCount, unresolvedExceptionCount: Math.max(0, exceptionCount - resolvedCount) },
  }
}

// The resolution filter only applies to the page already fetched, so totals stay the server's until wiring.
export function withMockRowResolutions(
  reportId: string,
  response: TransactionsResponse,
  resolutionFilter: TransactionListParams['resolution'],
): TransactionsResponse {
  const rows = response.rows.map((row) => {
    const resolution = resolutionForRow(reportId, row.id)
    return { ...row, resolution: resolution ? { id: resolution.id, kind: resolution.kind } : null }
  })
  if (resolutionFilter === 'resolved') return { ...response, rows: rows.filter((row) => row.resolution) }
  if (resolutionFilter === 'unresolved') return { ...response, rows: rows.filter((row) => !row.resolution) }
  return { ...response, rows }
}

export function withMockDetailResolution(reportId: string, detail: TransactionDetail): TransactionDetail {
  return { ...detail, resolution: resolutionForRow(reportId, detail.id) }
}
