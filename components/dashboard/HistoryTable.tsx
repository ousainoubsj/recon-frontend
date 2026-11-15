'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Loader2,
  MoreHorizontal,
  MoreVertical,
  Search,
  Star,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Menu } from '@base-ui/react/menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  useBulkDeleteReports,
  useReports,
  useToggleFavorite,
  useUpdateReportTag,
} from '@/lib/hooks/useReports'
import { getPageItems } from '@/lib/pagination'
import { formatReportReference } from '@/lib/format'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import { matchesHistoryFilter, type HistoryFilterKey } from '@/lib/historyFilters'
import type { Report, ReportTag } from '@/types/reports'

const PAGE_SIZE = 8
// No count-with-filters endpoint exists server-side — same tradeoff already
// accepted for Team/Audit Log: fetch a generous capped, filtered set in one
// shot and paginate client-side over it.
const FETCH_CAP = 200

// Box-shadow only, not border-color — avoids competing with the static
// border-line utility for the same CSS property at the same specificity.
const HIGHLIGHT_CLASSES = ['shadow-[0_0_0_3px_rgba(28,234,234,0.5)]']

const TAG_LABEL: Record<ReportTag, string> = {
  bank: 'Bank',
  supplier: 'Supplier',
  year_end: 'Year End',
}

const tagStyles: Record<ReportTag, string> = {
  bank: 'bg-accent-indigo-solid/15 text-accent-indigo-soft',
  supplier: 'bg-info-solid/15 text-info-soft',
  year_end: 'bg-violet-500/15 text-hue-violet-soft',
}

type DisplayStatus = 'Completed' | 'Completed with Issues' | 'Failed'

const statusStyles: Record<DisplayStatus, string> = {
  Completed: 'bg-success-solid/15 text-success',
  'Completed with Issues': 'bg-warning-solid/15 text-warning',
  Failed: 'bg-danger-solid/15 text-danger',
}

function displayStatus(report: Report): DisplayStatus {
  if (report.status === 'failed') return 'Failed'
  return report.mismatchedCount + report.unmatchedCount > 0 ? 'Completed with Issues' : 'Completed'
}

function matchRate(report: Report): number | null {
  if (report.status !== 'completed' || report.totalRows <= 0) return null
  return (report.matchedCount / report.totalRows) * 100
}

function truncateChars(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}...` : value
}

function Checkbox({ checked, onChange, ariaLabel }: { checked: boolean; onChange: () => void; ariaLabel?: string }) {
  return (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={ariaLabel}
        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-line bg-surface-sunken checked:border-brand checked:bg-brand"
      />
      <Check className="pointer-events-none absolute h-3 w-3 text-brand-foreground opacity-0 peer-checked:opacity-100" />
    </span>
  )
}

function RunByAvatar({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    return <Image src={image} alt={name} width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover" />
  }
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-500 text-[11px] font-semibold text-white">
      {initials || '—'}
    </span>
  )
}

// Two distinct copies for two distinct situations — genuinely no history yet
// (fresh org, nothing run) vs. history exists but the current search/date/
// quick filter combination excludes all of it. Sharing one message for both
// was misleading (told users to "clear filters" when there was nothing to
// clear).
function EmptyHistory({ hasActiveFilters }: { hasActiveFilters: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyHistoryGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="var(--brand)" />
          </linearGradient>
        </defs>
        <rect x="14" y="8" width="70" height="60" rx="8" fill="var(--surface-active)" stroke="var(--line)" strokeWidth="1.5" />
        <circle cx="24" cy="22" r="4" fill="var(--illus-1)" />
        <rect x="34" y="19.5" width="40" height="3" rx="1.5" fill="var(--illus-2)" />
        <rect x="34" y="26" width="26" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <circle cx="24" cy="38" r="4" fill="var(--brand)" fillOpacity="0.5" />
        <rect x="34" y="35.5" width="34" height="3" rx="1.5" fill="var(--illus-1)" />
        <rect x="34" y="42" width="22" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <circle cx="24" cy="54" r="4" fill="var(--illus-1)" />
        <rect x="34" y="51.5" width="40" height="3" rx="1.5" fill="var(--illus-1)" />
        <rect x="34" y="58" width="18" height="2.5" rx="1.25" fill="var(--illus-1)" />
        <circle cx="80" cy="66" r="16" fill="var(--surface)" stroke="var(--line)" strokeWidth="1.5" />
        {hasActiveFilters ? (
          <>
            <circle cx="80" cy="66" r="8" stroke="url(#emptyHistoryGlow)" strokeWidth="2" fill="none" />
            <path d="M80 61v5l3.5 2.5" stroke="url(#emptyHistoryGlow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        ) : (
          <path d="M80 60v12M74 66h12" stroke="url(#emptyHistoryGlow)" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
      {hasActiveFilters ? (
        <div>
          <p className="text-sm font-medium text-fg-strong">No reconciliations match these filters</p>
          <p className="mt-1 text-xs text-fg-muted">Try a different search term or clear the date/quick filters.</p>
        </div>
      ) : (
        <div>
          <p className="text-sm font-medium text-fg-strong">No reconciliations yet</p>
          <p className="mt-1 text-xs text-fg-muted">Run your first reconciliation to see it here.</p>
        </div>
      )}
    </div>
  )
}

type HistoryTableProps = {
  activeFilter: HistoryFilterKey
  // Bumped by the sidebar's "View All" link under Top File Pairs — there's
  // no separate "all file pairs" page, so it scrolls to and briefly
  // highlights this table instead.
  highlightSignal?: number
}

export default function HistoryTable({ activeFilter, highlightSignal }: HistoryTableProps) {
  const { formatCurrency } = useOrgFormat()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  // Separate from `selected` (the checkbox/bulk-bar selection) so that
  // canceling a single-row delete triggered from a row's kebab menu can't
  // leave that row phantom-selected in the bulk bar.
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!highlightSignal) return
    const el = containerRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.classList.add(...HIGHLIGHT_CLASSES)
    const timer = setTimeout(() => el.classList.remove(...HIGHLIGHT_CLASSES), 1500)
    return () => clearTimeout(timer)
  }, [highlightSignal])

  const { data: reports, isLoading } = useReports({
    q: q.trim() || undefined,
    dateFrom: dateRange?.from?.toISOString(),
    dateTo: dateRange?.to?.toISOString(),
    status: activeFilter === 'failed' ? 'failed' : activeFilter === 'completed' || activeFilter === 'issues' ? 'completed' : undefined,
    favoritesOnly: activeFilter === 'favorite' ? true : undefined,
    limit: FETCH_CAP,
  })

  const toggleFavorite = useToggleFavorite()
  const updateTag = useUpdateReportTag()
  const bulkDelete = useBulkDeleteReports()

  const rows = (reports ?? []).filter((r) => matchesHistoryFilter(r, activeFilter))
  const hasActiveFilters = q.trim() !== '' || dateRange?.from != null || activeFilter !== 'all'
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const resetToFirstPage = () => setPage(1)

  const allSelected = pagedRows.length > 0 && pagedRows.every((r) => selected.has(r.id))
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        pagedRows.forEach((r) => next.delete(r.id))
      } else {
        pagedRows.forEach((r) => next.add(r.id))
      }
      return next
    })
  }
  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleConfirmDelete = () => {
    if (!pendingDeleteIds) return
    const ids = pendingDeleteIds
    bulkDelete.mutate(ids, {
      onSuccess: () => {
        setSelected((prev) => {
          const next = new Set(prev)
          ids.forEach((id) => next.delete(id))
          return next
        })
        setPendingDeleteIds(null)
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              resetToFirstPage()
            }}
            placeholder="Search by name, file, reference, or notes..."
            className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-fg-subtle focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>

        <DateRangePicker
          value={dateRange}
          onChange={(value) => {
            setDateRange(value)
            resetToFirstPage()
          }}
        />
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent-indigo-solid/40 bg-accent-indigo-solid/10 px-4 py-1.5">
          <p className="text-sm font-medium text-foreground">{selected.size} selected</p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setPendingDeleteIds([...selected])}
              className="cursor-pointer bg-danger-solid text-white transition-all duration-300 hover:bg-rose-600 active:scale-95"
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="min-w-0 rounded-2xl border border-line bg-surface-raised/30 p-4 transition-shadow duration-500"
      >
        <ScrollArea className="min-w-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-fg-muted">
                <th className="w-8 pb-3 pr-3">
                  <Checkbox checked={allSelected} onChange={toggleAll} ariaLabel="Select all" />
                </th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Reconciliation Name</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">File Pair</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">
                  <span className="flex items-center gap-1">
                    Date &amp; Time
                    <ChevronsUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Match Rate</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Break Value</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Status</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Run By</th>
                <th className="pb-3 text-nowrap font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading || !reports ? (
                [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <tr key={i} className="border-t border-line-subtle">
                    <td className="py-3 pr-3 align-middle">
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-36" />
                        <Skeleton className="h-4 w-16 rounded-md" />
                      </div>
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2.5 w-14" />
                      </div>
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <Skeleton className="h-3 w-12" />
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <Skeleton className="h-3 w-20" />
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </td>
                    <td className="py-3 align-middle">
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                  </tr>
                ))
              ) : pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyHistory hasActiveFilters={hasActiveFilters} />
                  </td>
                </tr>
              ) : (
                pagedRows.map((row) => {
                  const runDate = new Date(row.runDate)
                  const rate = matchRate(row)
                  const status = displayStatus(row)
                  const reference = formatReportReference(row.sequenceYear, row.sequenceNumber)
                  const runByName = row.user.name
                  const isCompleted = row.status === 'completed'

                  return (
                    <tr key={row.id} className="border-t border-line-subtle">
                      <td className="py-3 pr-3 align-middle">
                        <Checkbox checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} ariaLabel={`Select ${row.name ?? 'reconciliation'}`} />
                      </td>
                      <td className="max-w-46 py-3 pr-4 align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Toggle favorite"
                            onClick={() => toggleFavorite.mutate({ id: row.id, isFavorited: row.isFavorited })}
                            className="mt-0.5 shrink-0 cursor-pointer text-fg-subtle hover:text-warning-soft"
                          >
                            <Star className={`h-4 w-4 ${row.isFavorited ? 'fill-amber-300 text-warning-soft' : ''}`} />
                          </button>
                          <div className="min-w-0">
                            {row.tag ? (
                              // With a tag badge already taking a line, just
                              // show the name — the ID is still available on
                              // hover rather than taking up its own line.
                              <TruncateTooltip
                                as="p"
                                className="truncate font-medium text-foreground"
                                tooltip={reference ? `${row.name ?? 'Untitled Reconciliation'} — ID: ${reference}` : (row.name ?? 'Untitled Reconciliation')}
                              >
                                {row.name ?? 'Untitled Reconciliation'}
                              </TruncateTooltip>
                            ) : (
                              <>
                                <TruncateTooltip as="p" className="truncate font-medium text-foreground" tooltip={row.name ?? 'Untitled Reconciliation'}>
                                  {row.name ?? 'Untitled Reconciliation'}
                                </TruncateTooltip>
                                {reference && (
                                  <TruncateTooltip as="p" className="truncate text-xs text-fg-subtle" tooltip={`ID: ${reference}`}>
                                    ID: {reference}
                                  </TruncateTooltip>
                                )}
                              </>
                            )}
                            {row.tag && (
                              <span className={`mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium ${tagStyles[row.tag]}`}>
                                {TAG_LABEL[row.tag]}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="max-w-42 py-3 pr-4 align-middle">
                        <TruncateTooltip as="p" className="truncate text-fg-secondary" tooltip={row.fileAName ?? '—'}>
                          {row.fileAName ?? '—'}
                        </TruncateTooltip>
                        <TruncateTooltip as="p" className="truncate text-fg-secondary" tooltip={`vs ${row.fileBName ?? '—'}`}>
                          <span className="text-fg-subtle">vs</span> {row.fileBName ?? '—'}
                        </TruncateTooltip>
                      </td>
                      <td className="py-3 pr-4 align-middle text-nowrap">
                        <p className="text-fg-strong">{runDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-xs text-fg-muted">{runDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                      </td>
                      <td className="py-3 pr-4 align-middle">
                        {rate == null ? (
                          <span className="text-fg-subtle">—</span>
                        ) : (
                          <>
                            <p className="font-semibold text-foreground">{rate.toFixed(2)}%</p>
                            <div className="mt-1.5 h-1.5 w-20 rounded-full bg-line-subtle">
                              <div
                                className={`h-1.5 rounded-full ${rate >= 95 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                          </>
                        )}
                      </td>
                      <td className="py-3 pr-4 align-middle text-nowrap font-medium text-danger">
                        {isCompleted ? formatCurrency(row.totalBreakValue) : <span className="text-fg-subtle">—</span>}
                      </td>
                      <td className="py-3 pr-4 align-middle">
                        <span className={`inline-block text-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 align-middle">
                        <div className="flex items-center gap-2">
                          <RunByAvatar name={runByName} image={row.user.image} />
                          <TruncateTooltip as="span" className="text-nowrap text-fg-strong" tooltip={runByName}>
                            {truncateChars(runByName, 10)}
                          </TruncateTooltip>
                        </div>
                      </td>
                      <td className="py-3 align-middle">
                        <Menu.Root>
                          <Menu.Trigger aria-label="More actions" className="cursor-pointer text-fg-muted outline-none hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Menu.Trigger>
                          <Menu.Portal>
                            <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50">
                              <Menu.Popup className="min-w-40 rounded-lg border border-line bg-surface shadow-lg shadow-black/40 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
                                <Menu.Item
                                  onClick={() => router.push(`/dashboard/reconciliation-process/${row.id}`)}
                                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-fg-strong outline-none transition-colors duration-300 data-highlighted:bg-overlay/5 data-highlighted:text-foreground"
                                >
                                  View Result
                                </Menu.Item>
                                <div className="my-1 h-px bg-line" />
                                {isCompleted && (
                                  <>
                                    {(Object.keys(TAG_LABEL) as ReportTag[])
                                      .filter((tag) => tag !== row.tag)
                                      .map((tag) => (
                                      <Menu.Item
                                        key={tag}
                                        onClick={() => updateTag.mutate({ id: row.id, tag })}
                                        className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-fg-strong outline-none transition-colors duration-300 data-highlighted:bg-overlay/5 data-highlighted:text-foreground"
                                      >
                                        Tag as {TAG_LABEL[tag]}
                                      </Menu.Item>
                                    ))}
                                    {row.tag && (
                                      <Menu.Item
                                        onClick={() => updateTag.mutate({ id: row.id, tag: null })}
                                        className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-fg-strong outline-none transition-colors duration-300 data-highlighted:bg-overlay/5 data-highlighted:text-foreground"
                                      >
                                        Clear Tag
                                      </Menu.Item>
                                    )}
                                    <div className="my-1 h-px bg-line" />
                                  </>
                                )}
                                <Menu.Item
                                  onClick={() => setPendingDeleteIds([row.id])}
                                  className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-danger outline-none transition-colors duration-300 data-highlighted:bg-danger-solid/10 data-highlighted:text-danger-soft"
                                >
                                  Delete
                                </Menu.Item>
                              </Menu.Popup>
                            </Menu.Positioner>
                          </Menu.Portal>
                        </Menu.Root>
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
            Showing {pagedRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {(safePage - 1) * PAGE_SIZE + pagedRows.length} of{' '}
            {rows.length} reconciliations
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
              className="cursor-pointer rounded-md p-1.5 text-fg-muted hover:bg-overlay/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {getPageItems(safePage, totalPages).map((item, i) =>
              item === '...' ? (
                <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-fg-subtle">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={`h-8 w-8 cursor-pointer rounded-md text-sm font-medium ${
                    safePage === item ? 'bg-accent-indigo-solid text-white' : 'text-fg-secondary hover:bg-overlay/5'
                  }`}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages}
              className="cursor-pointer rounded-md p-1.5 text-fg-muted hover:bg-overlay/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="rounded-md border border-line px-3 py-1.5 text-sm text-fg-secondary">{PAGE_SIZE} / page</span>
        </div>
      </div>

      <Dialog
        open={pendingDeleteIds != null}
        onOpenChange={(next) => {
          if (!next) setPendingDeleteIds(null)
        }}
      >
        <DialogContent className="border border-line bg-surface-raised p-3.5 text-foreground sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-danger">
              Delete {pendingDeleteIds?.length ?? 0} reconciliation{pendingDeleteIds?.length === 1 ? '' : 's'}?
            </DialogTitle>
            <DialogDescription className="text-sm text-fg-muted">
              This permanently deletes the selected reconciliation history and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-1 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteIds(null)}
              className="cursor-pointer border-line bg-transparent p-4 text-foreground transition-all duration-300 hover:bg-overlay/5 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={bulkDelete.isPending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md bg-danger-solid p-4 font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bulkDelete.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {bulkDelete.isPending ? `Deleting ${pendingDeleteIds?.length === 1 ? 'reconciliation' : 'reconciliations'}...` : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
