export type ColumnMapping = {
  fileA: { referenceNumber?: string; amount?: string; transactionDate?: string; currency?: string }
  fileB: { referenceNumber?: string; amount?: string; transactionDate?: string; currency?: string }
}

export type RuleConfig = {
  amountTolerance: number
  dateToleranceDays?: number
  sameCurrencyOnly?: boolean
  ignoreCase?: boolean
  ignoreSpaces?: boolean
  trimLeadingZeros?: boolean
  duplicateHandling?: "keep-first" | "keep-last" | "flag-all" | "skip"
}
