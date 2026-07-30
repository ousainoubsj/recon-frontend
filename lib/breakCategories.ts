// Shared between ResultsSidePanel and TransactionExplorerBoard — both
// render the same GET /reports/:id/break-breakdown categories, just in
// different layouts, so their icon/color per category must stay identical.
export const BREAK_CATEGORY_STYLE: Record<string, { icon: string; color: string }> = {
  'Amount Mismatch': { icon: '/icons/break-value.png', color: '#f87171' },
  'Missing in Counterparty File': { icon: '/icons/unmatched.png', color: '#fb923c' },
  'Missing in Internal Ledger': { icon: '/icons/match-rate.png', color: '#60a5fa' },
  'Date Mismatch': { icon: '/icons/date-mismatch.png', color: '#a78bfa' },
  Others: { icon: '/icons/others.png', color: '#34d399' },
}
