export type ColumnMapping = {
  fileA: { referenceNumber?: string; amount?: string; transactionDate?: string; currency?: string }
  fileB: { referenceNumber?: string; amount?: string; transactionDate?: string; currency?: string }
}

// Backend's rule-preview/run endpoints require referenceNumber/amount/
// transactionDate to actually be set per side (only currency stays
// optional) — distinct from ColumnMapping above, which stays all-optional
// to model the in-progress mapping-selection UI state before every field
// has been picked.
export type CompleteColumnMappingSide = { referenceNumber: string; amount: string; transactionDate: string; currency?: string }
export type CompleteColumnMapping = { fileA: CompleteColumnMappingSide; fileB: CompleteColumnMappingSide }

export type RuleConfig = {
  amountTolerance: number
  dateToleranceDays?: number
  sameCurrencyOnly?: boolean
  ignoreCase?: boolean
  ignoreSpaces?: boolean
  trimLeadingZeros?: boolean
  duplicateHandling?: "keep-first" | "keep-last" | "flag-all" | "skip"
}
