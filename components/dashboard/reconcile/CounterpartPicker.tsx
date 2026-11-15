'use client'

import { Search } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useTransactions } from '@/lib/hooks/useReports'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import { cn } from '@/lib/utils'
import type { TransactionListItem } from '@/types/reports'

const PICKER_PAGE_SIZE = 8
// Five 44px rows fit in h-64; past that the list gets a fixed height so ScrollArea (which needs one) can scroll.
const ROWS_BEFORE_SCROLL = 5

// Ledger amount for an internal (A) row, statement amount for a counterparty (B) row.
export function amountOnSide(row: Pick<TransactionListItem, 'ledgerAmount' | 'counterpartyAmount'>, side: 'A' | 'B') {
  return side === 'A' ? row.ledgerAmount : row.counterpartyAmount
}

type CounterpartPickerProps = {
  reportId: string
  // The side the picked row must come from: the opposite of the row being matched.
  side: 'A' | 'B'
  search: string
  onSearchChange: (search: string) => void
  selectedId?: string
  onSelect: (row: TransactionListItem) => void
}

export default function CounterpartPicker({ reportId, side, search, onSearchChange, selectedId, onSelect }: CounterpartPickerProps) {
  const { formatCurrency } = useOrgFormat()
  const { data, isLoading } = useTransactions(reportId, {
    status: side === 'A' ? 'unmatched_a' : 'unmatched_b',
    resolution: 'unresolved',
    search: search.trim() || undefined,
    limit: PICKER_PAGE_SIZE,
  })
  const rows = data?.rows ?? []
  const sideLabel = side === 'A' ? 'internal' : 'counterparty'

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search unmatched ${sideLabel} references`}
          className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-fg-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      {isLoading && (
        <div className="space-y-1">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-line-strong px-3 py-4 text-sm text-fg-muted">
          <span>
            No unresolved {sideLabel} transactions{search.trim() ? ` match "${search.trim()}"` : ''}.
          </span>
          {search.trim() && (
            <button type="button" onClick={() => onSearchChange('')} className="cursor-pointer text-info hover:text-info-soft">
              Clear
            </button>
          )}
        </div>
      )}

      <ScrollArea className={cn('w-full', rows.length > ROWS_BEFORE_SCROLL && 'h-48')}>
        <div className="space-y-1 pr-3">
          {rows.map((row) => {
            const amount = amountOnSide(row, side)
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onSelect(row)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                  row.id === selectedId ? 'border-brand bg-brand/10' : 'border-line hover:bg-overlay/5',
                )}
              >
                <TruncateTooltip as="span" className="min-w-0 flex-1 truncate text-fg-strong" tooltip={row.reference || '—'}>
                  {row.reference || '—'}
                </TruncateTooltip>
                <span className="shrink-0 text-xs text-fg-subtle">
                  {row.date ? new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
                <span className="shrink-0 font-medium text-fg-strong">{amount != null ? formatCurrency(amount) : '—'}</span>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
