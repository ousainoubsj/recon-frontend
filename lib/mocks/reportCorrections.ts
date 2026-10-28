// Phase 3 stand-in for the corrections API (docs/CORRECTIONS_PLAN.md). Deleted at wiring.
// In-memory, so a full page reload clears it; client-side navigation keeps it.
import { ApiError } from '@/lib/axios'
import type {
  CorrectionField,
  CorrectionSide,
  CreateCorrectionInput,
  ReportCorrection,
  ReportDetail,
  TransactionDetail,
  TransactionsResponse,
} from '@/types/reports'

// rowReference lets a completed rerun's new rows find the corrections copied from its source.
type MockCorrection = ReportCorrection & { rowId: string; rowReference: string }

const MOCK_LATENCY_MS = 400
const MOCK_USER = { id: 'mock-user', name: 'You (mock)' }

// Add a completed report's id here to see the "Corrections need a rerun" state of a pre-feature report.
export const MOCK_PRE_FEATURE_REPORT_IDS = new Set<string>()

const correctionsByReport = new Map<string, MockCorrection[]>()
// The real API reads original values from the row; the mock remembers the details the sidebar loaded.
const detailsByRow = new Map<string, TransactionDetail>()

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

function correctionsFor(reportId: string) {
  return correctionsByReport.get(reportId) ?? []
}

function toContract(correction: MockCorrection): ReportCorrection {
  const { id, side, rowIndex, field, originalValue, correctedValue, reason, applied, createdBy, createdAt } = correction
  return { id, side, rowIndex, rowReference: correction.rowReference || null, field, originalValue, correctedValue, reason, applied, createdBy, createdAt }
}

function belongsToRow(correction: MockCorrection, row: { id: string; reference: string }) {
  if (correction.rowId === row.id) return true
  // The real run applies a corrected reference; the mocked one doesn't, so either reference identifies the row.
  const isSameRow = row.reference === correction.rowReference || (correction.field === 'reference' && row.reference === correction.correctedValue)
  return correction.applied && isSameRow
}

// Stands in for the row's file position, which the explorer API doesn't expose.
function mockRowIndex(rowId: string) {
  return parseInt(rowId.replace(/-/g, '').slice(0, 6), 16) % 5000
}

function validationError(detail: string) {
  return new ApiError({ type: 'https://recon.app/errors/validation-error', title: 'ValidationError', status: 422, detail })
}

// Mirrors the engine's parseAmount/parseDate acceptance, which the real endpoint calls.
function assertParseable(field: CorrectionField, value: string) {
  if (field === 'amount') {
    const cleaned = value.replace(/[^0-9.-]/g, '')
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(cleaned)) throw validationError('Enter an amount such as 1250.00')
  }
  if (field === 'date' && Number.isNaN(new Date(value).getTime())) throw validationError('Enter a date such as 2026-10-28')
}

function originalValueOf(detail: TransactionDetail | undefined, side: CorrectionSide, field: CorrectionField) {
  if (!detail) return null
  if (field === 'reference') return detail.reference || null
  if (field === 'date') return detail.date
  if (field === 'amount') {
    const amount = side === 'A' ? detail.ledgerAmount : detail.counterpartyAmount
    return amount == null ? null : String(amount)
  }
  return null
}

export function withMockCorrectionSummary(reportId: string, report: ReportDetail): ReportDetail {
  const corrections = correctionsFor(reportId)
  return {
    ...report,
    correctionSummary: {
      pending: corrections.filter((c) => !c.applied).length,
      applied: corrections.filter((c) => c.applied).length,
    },
  }
}

export function withMockCorrectionBadges(reportId: string, response: TransactionsResponse): TransactionsResponse {
  const corrections = correctionsFor(reportId)
  return {
    ...response,
    rows: response.rows.map((row) => ({
      ...row,
      corrections: corrections
        .filter((c) => belongsToRow(c, row))
        .map((c) => ({ field: c.field, side: c.side, applied: c.applied })),
    })),
  }
}

export function withMockCorrectionDetail(reportId: string, detail: TransactionDetail): TransactionDetail {
  detailsByRow.set(detail.id, detail)
  const correctableSides: CorrectionSide[] = []
  if (!MOCK_PRE_FEATURE_REPORT_IDS.has(reportId)) {
    if (detail.rawA) correctableSides.push('A')
    if (detail.rawB) correctableSides.push('B')
  }
  return {
    ...detail,
    corrections: correctionsFor(reportId).filter((c) => belongsToRow(c, detail)).map(toContract),
    correctableSides,
  }
}

export async function mockListCorrections(reportId: string): Promise<ReportCorrection[]> {
  await wait()
  return correctionsFor(reportId).map(toContract)
}

export async function mockCreateCorrection(reportId: string, input: CreateCorrectionInput): Promise<ReportCorrection> {
  await wait()
  assertParseable(input.field, input.correctedValue)
  const correction: MockCorrection = {
    id: crypto.randomUUID(),
    rowId: input.rowId,
    rowReference: detailsByRow.get(input.rowId)?.reference ?? '',
    side: input.side,
    rowIndex: mockRowIndex(input.rowId),
    field: input.field,
    originalValue: originalValueOf(detailsByRow.get(input.rowId), input.side, input.field),
    correctedValue: input.correctedValue,
    reason: input.reason,
    applied: false,
    createdBy: MOCK_USER,
    createdAt: new Date().toISOString(),
  }
  // One pending correction per row, side and field: a new one replaces it.
  const kept = correctionsFor(reportId).filter(
    (c) => c.applied || c.rowId !== input.rowId || c.side !== input.side || c.field !== input.field,
  )
  correctionsByReport.set(reportId, [...kept, correction])
  return toContract(correction)
}

export async function mockDeleteCorrection(reportId: string, correctionId: string) {
  await wait()
  const target = correctionsFor(reportId).find((c) => c.id === correctionId)
  if (!target) {
    throw new ApiError({ type: 'https://recon.app/errors/not-found', title: 'NotFoundError', status: 404, detail: 'Correction not found' })
  }
  if (target.applied) {
    throw new ApiError({ type: 'https://recon.app/errors/conflict', title: 'ConflictError', status: 409, detail: 'An applied correction cannot be removed' })
  }
  correctionsByReport.set(reportId, correctionsFor(reportId).filter((c) => c.id !== correctionId))
}

// The real rerun copies the source's effective set (pending over applied) as pending.
export function mockCopyCorrectionsToRerun(sourceId: string, draftId: string) {
  const source = correctionsFor(sourceId)
  const effective = source.filter(
    (c) => !c.applied || !source.some((p) => !p.applied && p.rowId === c.rowId && p.side === c.side && p.field === c.field),
  )
  correctionsByReport.set(
    draftId,
    effective.map((c) => ({ ...c, id: crypto.randomUUID(), applied: false })),
  )
}

// The real updateDraft deletes a side's corrections when that side's file changes.
export function mockDropSideCorrections(draftId: string, side: CorrectionSide) {
  correctionsByReport.set(draftId, correctionsFor(draftId).filter((c) => c.side !== side))
}

// Stands in for the run marking the draft's corrections applied, so the completed rerun shows "Corrected" badges.
export function mockApplyCorrections(reportId: string) {
  correctionsByReport.set(reportId, correctionsFor(reportId).map((c) => ({ ...c, applied: true })))
}
