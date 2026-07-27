import type { Report } from '@/types/reports'

export type HistoryFilterKey = 'all' | 'completed' | 'issues' | 'failed' | 'favorite'

export function hasIssues(report: Pick<Report, 'mismatchedCount' | 'unmatchedCount'>) {
  return report.mismatchedCount + report.unmatchedCount > 0
}

// Single source of truth for what each Quick Filter means, shared by
// HistoryTable (applied to its own fetched rows) and HistorySidebar
// (applied to its own full fetch to compute the counts) so the two can never
// drift out of sync with each other.
export function matchesHistoryFilter(report: Report, filter: HistoryFilterKey): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'completed':
      return report.status === 'completed'
    case 'issues':
      return report.status === 'completed' && hasIssues(report)
    case 'failed':
      return report.status === 'failed'
    case 'favorite':
      return report.isFavorited
  }
}
