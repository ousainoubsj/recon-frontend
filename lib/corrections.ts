import type { CorrectionField, CorrectionSide } from '@/types/reports'
import type { ColumnMapping } from '@/types/wizard'

export const CORRECTION_FIELD_LABEL: Record<CorrectionField, string> = {
  reference: 'Reference',
  amount: 'Amount',
  date: 'Date',
  currency: 'Currency',
}

export const CORRECTION_SIDE_LABEL: Record<CorrectionSide, string> = {
  A: 'Internal ledger',
  B: 'Counterparty',
}

// The mapping key each correctable field reads its source column from.
export const CORRECTION_FIELD_MAPPING_KEY: Record<CorrectionField, 'referenceNumber' | 'amount' | 'transactionDate' | 'currency'> = {
  reference: 'referenceNumber',
  amount: 'amount',
  date: 'transactionDate',
  currency: 'currency',
}

// The raw cell the run read for this field; the API derives the stored original the same way.
export function sourceCellValue(
  raw: Record<string, string> | null,
  mapping: ColumnMapping | null | undefined,
  side: CorrectionSide,
  field: CorrectionField,
) {
  const column = (side === 'A' ? mapping?.fileA : mapping?.fileB)?.[CORRECTION_FIELD_MAPPING_KEY[field]]
  if (!raw || !column) return null
  return raw[column] || null
}
