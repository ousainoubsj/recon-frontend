'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleDot,
  Eye,
  Search,
} from 'lucide-react'
import type { ApexOptions } from 'apexcharts'
import type { DateRange } from 'react-day-picker'
import { MoneyInput } from '@/components/money-input'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { AreaChartSkeleton } from '@/components/ui/chart-skeletons'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBreakBreakdown, useFilePairTrend, useReport, useTransactions } from '@/lib/hooks/useReports'
import { formatNumber, formatPercent } from '@/lib/format'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import { BREAK_CATEGORY_STYLE } from '@/lib/breakCategories'
import { EmptySuccessState, EmptyTransactions } from './EmptyStates'
import CorrectionBadge from './CorrectionBadge'
import ResolutionBadge from './ResolutionBadge'
import type { TransactionListParams, TransactionRowStatus } from '@/types/reports'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export type FilterKey = 'all' | 'matched' | 'unmatched' | 'mismatched' | 'duplicates' | 'breakValue'

// Shared shape for "jump into the Explorer" callbacks threaded up from
// Results (row-level Eye icons pass rowId; the Quick Actions cards pass a
// filter to preselect one of the header stat cards).
export type GoToExplorerOptions = { rowId?: string; filter?: FilterKey }
type StatusFilterValue = 'matched' | 'mismatched' | 'unmatched' | 'duplicate' | undefined

const statusConfig: Record<TransactionRowStatus, { Icon: typeof CheckCircle2; className: string }> = {
  Matched: { Icon: CheckCircle2, className: 'bg-success-solid/15 text-success' },
  Unmatched: { Icon: CircleDot, className: 'bg-warning-solid/15 text-warning' },
  Duplicate: { Icon: CircleDot, className: 'bg-violet-500/15 text-hue-violet' },
  Mismatched: { Icon: CircleDot, className: 'bg-danger-solid/15 text-danger' },
}

// Labels each point with its dense rank among currently-existing runs (from
// getFilePairTrend's runLabels) — contiguous and always reflects true
// recency against the full history, e.g. "last 7 of 8 total" reads as Run
// 2..8, never a raw array-position "Run 1..5" (misleading about recency)
// or a gapped permanent reference number (looks broken after a deletion).
function runLabels(ranks: (number | null)[]) {
  return ranks.map((n) => (n != null ? `Run ${n}` : 'Run —'))
}

const PAGE_SIZE = 5

type TransactionExplorerBoardProps = {
  reportId: string
  selectedRowId?: string
  onSelectRow: (rowId: string, opts?: { auto?: boolean }) => void
  onBackToResults?: () => void
  initialFilter?: FilterKey
  // Lets the sibling detail sidebar tell "still loading, a row will get
  // auto-selected shortly" apart from "loaded and genuinely empty" — both
  // look identical from the outside (no selectedRowId yet).
  onLoadingChange?: (isLoading: boolean) => void
}

export default function TransactionExplorerBoard({
  reportId,
  selectedRowId,
  onSelectRow,
  onBackToResults,
  initialFilter,
  onLoadingChange,
}: TransactionExplorerBoardProps) {
  const { formatCurrency, currencySymbol } = useOrgFormat()
  const [activeFilter, setActiveFilter] = useState<FilterKey>(initialFilter ?? 'all')
  const [q, setQ] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [resolutionFilter, setResolutionFilter] = useState<TransactionListParams['resolution']>(undefined)
  const [page, setPage] = useState(1)

  const { data: report } = useReport(reportId)

  const statusFilter: StatusFilterValue =
    activeFilter === 'matched'
      ? 'matched'
      : activeFilter === 'unmatched'
        ? 'unmatched'
        : activeFilter === 'mismatched'
          ? 'mismatched'
          : activeFilter === 'duplicates'
            ? 'duplicate'
            : undefined

  // A lone "-" is a negative amount mid-typing, not a filter value
  const toAmountParam = (raw: string) => (raw === '' || raw === '-' ? undefined : Number(raw))

  const { data, isLoading } = useTransactions(reportId, {
    search: q.trim() || undefined,
    status: statusFilter,
    resolution: resolutionFilter,
    amountMin: toAmountParam(amountMin),
    amountMax: toAmountParam(amountMax),
    dateFrom: dateRange?.from?.toISOString(),
    dateTo: dateRange?.to?.toISOString(),
    sortBy: 'date',
    sortDir,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })
  const { data: breakdown, isLoading: isBreakdownLoading } = useBreakBreakdown(reportId)
  // No file-pair/overall toggle here (unlike Results' Match Rate chart) —
  // always the org's last 7 runs regardless of file pair.
  const { data: trend, isLoading: isTrendLoading } = useFilePairTrend(reportId, 'overall', 5)

  const rows = data?.rows ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // The details sidebar shouldn't sit empty on arrival — default to the
  // first row of whatever's currently on screen until the user picks one.
  const firstRowId = rows[0]?.id
  useEffect(() => {
    if (!selectedRowId && firstRowId) onSelectRow(firstRowId, { auto: true })
  }, [selectedRowId, firstRowId, onSelectRow])

  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  const resetToFirstPage = () => setPage(1)

  const statCards: { key: FilterKey; label: string; value: string; percent?: string; labelColor: string; valueColor: string; clickable: boolean }[] = report
    ? [
        { key: 'all', label: 'All Transactions', value: formatNumber(report.totalRows), labelColor: 'text-info', valueColor: 'text-foreground', clickable: true },
        {
          key: 'matched',
          label: 'Matched',
          value: formatNumber(report.matchedCount),
          percent: formatPercent(report.totalRows > 0 ? (report.matchedCount / report.totalRows) * 100 : 0, 2),
          labelColor: 'text-success',
          valueColor: 'text-foreground',
          clickable: true,
        },
        {
          key: 'unmatched',
          label: 'Unmatched',
          value: formatNumber(report.unmatchedCount),
          percent: formatPercent(report.totalRows > 0 ? (report.unmatchedCount / report.totalRows) * 100 : 0, 2),
          labelColor: 'text-warning',
          valueColor: 'text-foreground',
          clickable: true,
        },
        {
          key: 'duplicates',
          label: 'Duplicates',
          value: formatNumber(report.duplicateCount),
          percent: formatPercent(report.totalRows > 0 ? (report.duplicateCount / report.totalRows) * 100 : 0, 2),
          labelColor: 'text-hue-violet',
          valueColor: 'text-foreground',
          clickable: true,
        },
        // Not a real status filter server-side — display-only, per explicit decision.
        { key: 'breakValue', label: 'Break Value', value: formatCurrency(report.totalBreakValue), labelColor: 'text-danger', valueColor: 'text-danger', clickable: false },
      ]
    : []

  const matchStatusSegments = report
    ? [
        { label: 'Matched', value: report.matchedCount, color: '#34D399' },
        { label: 'Unmatched', value: report.unmatchedCount, color: '#FB923C' },
        { label: 'Mismatched', value: report.mismatchedCount, color: '#FB7185' },
        { label: 'Duplicates', value: report.duplicateCount, color: '#A78BFA' },
      ]
    : []
  const matchStatusTotal = matchStatusSegments.reduce((sum, s) => sum + s.value, 0)
  const matchStatusOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: matchStatusSegments.map((s) => s.label),
    colors: matchStatusSegments.map((s) => s.color),
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { show: false },
    plotOptions: { pie: { donut: { size: '72%' } } },
    tooltip: { theme: 'dark' },
  }

  const chartDays = runLabels(trend?.runLabels.current ?? [])
  const breakValueTrendSeries = trend ? [{ name: 'Break Value', data: trend.breakValueTrend.current }] : []
  const breakValueTrendOptions: ApexOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#34D399'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 4, strokeColors: 'var(--surface-raised)', strokeWidth: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    grid: { borderColor: 'var(--line)', strokeDashArray: 4, yaxis: { lines: { show: true } } },
    legend: { show: false },
    xaxis: { categories: chartDays, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { colors: 'var(--fg-muted)' } } },
    yaxis: {
      min: 0,
      tickAmount: 4,
      labels: { formatter: (value) => `${currencySymbol}${Math.round(value / 1000)}K`, style: { colors: 'var(--fg-muted)' } },
    },
    tooltip: { theme: 'dark', y: { formatter: (value) => formatCurrency(value) } },
  }

  const maxBreakAmount = Math.max(1, ...(breakdown ?? []).map((b) => b.amount))

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transaction Explorer</h1>
          <p className="mt-1 text-sm text-fg-muted">Drill down and review transactions in detail. Use filters to find specific records.</p>
        </div>
        <Button
          type="button"
          onClick={onBackToResults}
          className="cursor-pointer rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <button
            key={card.key}
            type="button"
            disabled={!card.clickable}
            onClick={() => {
              if (!card.clickable) return
              setActiveFilter(card.key)
              resetToFirstPage()
            }}
            className={`min-w-0 rounded-xl border p-3 text-left transition-colors ${card.clickable ? 'cursor-pointer' : 'cursor-default'} ${
              activeFilter === card.key && card.clickable ? 'border-info-solid bg-info-solid/10' : 'border-line bg-surface-raised/40 hover:bg-overlay/5'
            }`}
          >
            <p className={`text-sm font-medium ${activeFilter === card.key && card.clickable ? 'text-info' : card.labelColor}`}>{card.label}</p>
            <div className="flex min-w-0 items-center justify-between gap-2">
              <TruncateTooltip as="span" className={`truncate text-2xl font-semibold ${card.valueColor}`} tooltip={card.value}>
                {card.value}
              </TruncateTooltip>
              {card.percent && <span className={`shrink-0 text-sm font-normal ${card.labelColor}`}>{card.percent}</span>}
            </div>
          </button>
        ))}
      </div>

      {/* One line of filters that shares the board's width; each control shrinks rather than wrapping. */}
      <div className="flex items-end gap-3">
        <div className="relative min-w-0 flex-[1.5]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              resetToFirstPage()
            }}
            placeholder="Search reference, description..."
            className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-fg-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label className="text-xs text-fg-muted">Match Status</label>
          <Select
            value={statusFilter ?? 'all'}
            onValueChange={(value) => {
              const v = value as StatusFilterValue | 'all'
              setActiveFilter(
                v === 'all'
                  ? 'all'
                  : v === 'matched'
                    ? 'matched'
                    : v === 'unmatched'
                      ? 'unmatched'
                      : v === 'mismatched'
                        ? 'mismatched'
                        : v === 'duplicate'
                          ? 'duplicates'
                          : 'all',
              )
              resetToFirstPage()
            }}
            items={{ all: 'All', matched: 'Matched', mismatched: 'Mismatched', unmatched: 'Unmatched', duplicate: 'Duplicate' }}
          >
            <SelectTrigger className="h-9! w-full cursor-pointer justify-between gap-6 border-line bg-surface text-sm text-fg-strong">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="mismatched">Mismatched</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
              <SelectItem value="duplicate">Duplicate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label className="text-xs text-fg-muted">Resolution</label>
          <Select
            value={resolutionFilter ?? 'all'}
            onValueChange={(value) => {
              setResolutionFilter(value === 'resolved' || value === 'unresolved' ? value : undefined)
              resetToFirstPage()
            }}
            items={{ all: 'All', unresolved: 'Unresolved', resolved: 'Resolved' }}
          >
            <SelectTrigger className="h-9! w-full cursor-pointer justify-between gap-6 border-line bg-surface text-sm text-fg-strong">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label className="text-xs text-fg-muted">Amount Range</label>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg-strong">
            <MoneyInput
              allowNegative
              value={amountMin}
              onValueChange={(next) => {
                setAmountMin(next)
                resetToFirstPage()
              }}
              placeholder="Min"
              className="w-full min-w-0 bg-transparent placeholder:text-fg-subtle focus:outline-none"
            />
            <span className="text-fg-subtle">-</span>
            <MoneyInput
              allowNegative
              value={amountMax}
              onValueChange={(next) => {
                setAmountMax(next)
                resetToFirstPage()
              }}
              placeholder="Max"
              className="w-full min-w-0 bg-transparent placeholder:text-fg-subtle focus:outline-none"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label className="text-xs text-fg-muted">Date Range</label>
          <DateRangePicker
            className="w-full"
            value={dateRange}
            onChange={(value) => {
              setDateRange(value)
              resetToFirstPage()
            }}
          />
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-line bg-surface-raised/30 p-4">
        <ScrollArea className="min-w-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-fg-muted">
                <th className="pb-3 pr-4 text-nowrap font-semibold">Status</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Reference</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">
                  <button
                    type="button"
                    onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                    className="flex cursor-pointer items-center gap-1"
                  >
                    Date
                    <ChevronsUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Description</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold text-right">Ledger Amount</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold text-right">Counterparty Amount</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold text-right">Difference</th>
                <th className="pb-3 text-nowrap font-semibold" />
              </tr>
            </thead>
            <tbody>
              {isLoading || !data ? (
                [0, 1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-t border-line-subtle">
                    <td className="py-3 pr-4"><Skeleton className="h-5 w-20 rounded-md" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-3 w-20" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-3 w-16" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-3 w-32" /></td>
                    <td className="py-3 pr-4"><Skeleton className="ml-auto h-3 w-16" /></td>
                    <td className="py-3 pr-4"><Skeleton className="ml-auto h-3 w-16" /></td>
                    <td className="py-3 pr-4"><Skeleton className="ml-auto h-3 w-14" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-4 rounded" /></td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyTransactions />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const { Icon, className } = statusConfig[row.status]
                  return (
                    <tr key={row.id} className="border-t border-line-subtle">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-nowrap ${className}`}>
                            <Icon className="h-3.5 w-3.5" />
                            {row.status}
                          </span>
                          {row.resolution && <ResolutionBadge kind={row.resolution.kind} />}
                          {row.corrections.some((c) => c.applied) && <CorrectionBadge applied />}
                          {row.corrections.some((c) => !c.applied) && <CorrectionBadge applied={false} />}
                        </div>
                      </td>
                      <td className="max-w-32 py-3 pr-4">
                        <TruncateTooltip as="p" className="truncate text-fg-secondary" tooltip={row.reference || '—'}>
                          {row.reference || '—'}
                        </TruncateTooltip>
                      </td>
                      <td className="py-3 pr-4 text-nowrap text-fg-secondary">
                        {row.date ? new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="max-w-48 py-3 pr-4">
                        <TruncateTooltip as="p" className="truncate text-fg-secondary" tooltip={row.description || '—'}>
                          {row.description || '—'}
                        </TruncateTooltip>
                      </td>
                      <td className="py-3 pr-4 text-nowrap text-right text-fg-strong">{row.ledgerAmount != null ? formatCurrency(row.ledgerAmount) : '—'}</td>
                      <td className="py-3 pr-4 text-nowrap text-right text-fg-strong">{row.counterpartyAmount != null ? formatCurrency(row.counterpartyAmount) : '—'}</td>
                      {/* hasDifference only means "the raw amount diff isn't
                          exactly zero" — a date-mismatch or even a matched
                          row can still have a small within-tolerance
                          difference. Only color it red when amount is
                          actually this row's break reason. */}
                      <td className={`py-3 pr-4 text-nowrap text-right ${row.hasDifference && row.type === 'Amount Mismatch' ? 'text-danger' : 'text-fg-strong'}`}>
                        {row.difference != null ? formatCurrency(row.difference) : '—'}
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          aria-label="View details"
                          onClick={() => onSelectRow(row.id)}
                          className={`cursor-pointer hover:text-foreground ${row.reviewed ? 'text-success' : 'text-fg-muted'}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <p className="text-sm text-fg-muted">
            Showing {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, total)} of {formatNumber(total)} transactions
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer rounded-md border border-line p-1.5 text-fg-muted hover:bg-overlay/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(0, 10)
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium ${
                    page === p ? 'border-brand text-brand-text' : 'border-line text-fg-secondary hover:bg-overlay/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="cursor-pointer rounded-md border border-line p-1.5 text-fg-muted hover:bg-overlay/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button type="button" className="flex cursor-pointer items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm text-fg-secondary hover:bg-overlay/5">
            {PAGE_SIZE} / page
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-surface-raised/30 p-4">
        <div className="grid grid-cols-1 divide-y divide-line lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <div className="pb-6 lg:pb-0 lg:pr-6">
            <h3 className="text-base font-semibold text-foreground">Breakdown by Match Status</h3>
            <div className="mt-12 flex items-center gap-2">
              <div className="relative w-36 shrink-0">
                <Chart options={matchStatusOptions} series={matchStatusSegments.map((s) => s.value)} type="donut" height={150} />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-bold text-foreground">{formatNumber(matchStatusTotal)}</p>
                  <p className="text-xs text-fg-muted">Total</p>
                </div>
              </div>

              <ul className="space-y-2.5">
                {matchStatusSegments.map((seg) => (
                  <li key={seg.label} className="flex items-start gap-2">
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{seg.label}</p>
                      <p className="text-xs text-fg-muted text-nowrap">
                        {formatNumber(seg.value)} ({matchStatusTotal > 0 ? ((seg.value / matchStatusTotal) * 100).toFixed(2) : '0.00'}%)
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="py-6 lg:py-0 lg:px-6">
            <h3 className="text-base font-semibold text-foreground">Break Value Trend</h3>
            <div className="mt-2">
              {isTrendLoading || !trend ? (
                <div className="h-55 w-full">
                  <AreaChartSkeleton />
                </div>
              ) : (
                <Chart options={breakValueTrendOptions} series={breakValueTrendSeries} type="area" height={220} />
              )}
            </div>
          </div>

          <div className="pt-6 lg:pt-0 lg:pl-6">
            <h3 className="text-base font-semibold text-foreground">Top Break Causes</h3>
            {isBreakdownLoading || !breakdown ? (
              <ul className="mt-4 space-y-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <li key={i} className="space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-1 w-full rounded-full" />
                  </li>
                ))}
              </ul>
            ) : breakdown.length === 0 ? (
              <div className="mt-8">
              <EmptySuccessState title="No breaks to categorize" subtitle="Every transaction matched cleanly." />
              </div>
            ) : (
              <ul className="mt-4 space-y-4">
                {breakdown.slice(0, 5).map((item) => {
                  const style = BREAK_CATEGORY_STYLE[item.category] ?? BREAK_CATEGORY_STYLE.Others
                  return (
                    <li key={item.category}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <TruncateTooltip as="span" className="truncate text-fg-secondary" tooltip={item.category}>
                          {item.category}
                        </TruncateTooltip>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                          <span className="w-14 text-right text-fg-muted">{formatPercent(item.percent, 2)}</span>
                        </span>
                      </div>
                      <div className="mt-2 h-1 w-full rounded-full bg-line-subtle">
                        <div className="h-1 rounded-full" style={{ width: `${(item.amount / maxBreakAmount) * 100}%`, backgroundColor: style.color }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
