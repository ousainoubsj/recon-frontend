'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Download, FileSpreadsheet, History, RotateCcw, Table2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useBreakBreakdown, useCanEditReports } from '@/lib/hooks/useReports'
import { formatFileSize, formatNumber, formatPercent } from '@/lib/format'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import { BREAK_CATEGORY_STYLE } from '@/lib/breakCategories'
import { EmptySuccessState } from './EmptyStates'
import RerunReportDialog from './RerunReportDialog'
import type { ReportDetail } from '@/types/reports'
import type { GoToExplorerOptions } from './TransactionExplorerBoard'

type ResultsSidePanelProps = {
  reportId: string
  report: ReportDetail
  onGoToExplorer?: (opts?: GoToExplorerOptions) => void
}

export default function ResultsSidePanel({ reportId, report, onGoToExplorer }: ResultsSidePanelProps) {
  const router = useRouter()
  const { formatCurrency, formatDateTime } = useOrgFormat()
  const { data: breakdown, isLoading } = useBreakBreakdown(reportId)
  const canEdit = useCanEditReports()
  const [isRerunOpen, setIsRerunOpen] = useState(false)
  const { unresolvedExceptionCount } = report.resolutionSummary
  const unmatchedCaption = `${formatNumber(unresolvedExceptionCount)} unresolved exception${unresolvedExceptionCount === 1 ? '' : 's'}`
  const maxAmount = Math.max(1, ...(breakdown ?? []).map((b) => b.amount))

  const fileSummary = [
    { title: 'Internal Ledger', filename: report.fileAName, accent: '#04E2B8', summary: report.fileASummary },
    { title: 'Counterparty File', filename: report.fileBName, accent: '#9366DE', summary: report.fileBSummary },
  ]

  return (
    <ScrollArea className="h-191 w-full min-w-0 pr-3">
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-line bg-surface-raised/50 p-4">
          <TruncateTooltip as="h3" className="truncate text-lg font-semibold text-foreground" tooltip="Breakdown by Category (Top 5)">
            Breakdown by Category <span className="text-sm font-normal text-fg-muted">(Top 5)</span>
          </TruncateTooltip>

          {isLoading || !breakdown ? (
            <ul className="mt-4 space-y-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-1 w-full rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-10" />
                </li>
              ))}
            </ul>
          ) : breakdown.length === 0 ? (
            <EmptySuccessState title="No breaks to categorize" subtitle="Every transaction matched cleanly." />
          ) : (
            <ul className="mt-4 space-y-4">
              {breakdown.slice(0, 5).map((item) => {
                const style = BREAK_CATEGORY_STYLE[item.category] ?? BREAK_CATEGORY_STYLE.Others
                const width = (item.amount / maxAmount) * 100
                return (
                  <li key={item.category} className="flex items-center gap-3">
                    <Image src={style.icon} alt="" width={36} height={36} className="h-9 w-9 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <TruncateTooltip as="p" className="truncate text-sm text-fg-strong" tooltip={item.category}>
                          {item.category}
                        </TruncateTooltip>
                        <p className="shrink-0 text-sm font-medium text-foreground">{formatCurrency(item.amount)}</p>
                      </div>
                      <div className="mt-2 h-1 w-full rounded-full bg-line-subtle">
                        <div className="h-1 rounded-full" style={{ width: `${width}%`, backgroundColor: style.color }} />
                      </div>
                    </div>
                    <p className="w-14 shrink-0 text-right text-sm text-fg-muted">{formatPercent(item.percent, 2)}</p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface-raised/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground">File Summary</h3>
          </div>

          <div className="mt-4 grid grid-cols-1 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {fileSummary.map((file) => (
              <div key={file.title} className="pt-4 first:pt-0 sm:pt-0 sm:pr-4 sm:last:pr-0 sm:last:pl-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${file.accent}26`, color: file.accent }}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <TruncateTooltip as="p" className="truncate text-sm font-semibold text-foreground" tooltip={file.title}>
                      {file.title}
                    </TruncateTooltip>
                    <TruncateTooltip as="p" className="truncate text-xs text-fg-muted" tooltip={file.filename ?? '—'}>
                      {file.filename ?? '—'}
                    </TruncateTooltip>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Rows</span>
                    <span className="font-medium text-fg-strong">{file.summary ? formatNumber(file.summary.rows) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Columns</span>
                    <span className="font-medium text-fg-strong">{file.summary ? formatNumber(file.summary.columns) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">File Size</span>
                    <span className="font-medium text-fg-strong">{file.summary ? formatFileSize(file.summary.fileSizeBytes) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-fg-muted">Imported</span>
                    <TruncateTooltip as="span" className="truncate font-medium text-fg-strong" tooltip={formatDateTime(report.runDate)}>
                      {formatDateTime(report.runDate)}
                    </TruncateTooltip>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-fg-muted">Status</span>
                    <span className="flex items-center gap-1.5 font-medium text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Processed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface-raised p-4">
          <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onGoToExplorer?.({ filter: 'unmatched' })}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-left hover:bg-overlay/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-warning-solid/15">
                <Image src="/icons/unmatched.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
              </span>
              <div className="min-w-0">
                <TruncateTooltip as="p" className="truncate text-sm font-semibold text-foreground" tooltip="View Unmatched">
                  View Unmatched
                </TruncateTooltip>
                <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-fg-muted" tooltip={unmatchedCaption}>
                  {unmatchedCaption}
                </TruncateTooltip>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onGoToExplorer?.({ filter: 'duplicates' })}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-left hover:bg-overlay/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-violet-500/15">
                <Image src="/icons/duplicates.png" alt="" width={40} height={40} className="h-10 w-10 object-contain" />
              </span>
              <div className="min-w-0">
                <TruncateTooltip as="p" className="truncate text-sm font-semibold text-foreground" tooltip="View Duplicates">
                  View Duplicates
                </TruncateTooltip>
                <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-fg-muted" tooltip="Review duplicate records">
                  Review duplicate records
                </TruncateTooltip>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onGoToExplorer?.()}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-left hover:bg-overlay/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success-solid/15 text-success">
                <Table2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <TruncateTooltip as="p" className="truncate text-sm font-semibold text-foreground" tooltip="Transaction Explorer">
                  Transaction Explorer
                </TruncateTooltip>
                <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-fg-muted" tooltip="Drill down to transaction level">
                  Drill down to transaction level
                </TruncateTooltip>
              </div>
            </button>

            <button
              type="button"
              onClick={() => router.push(`/dashboard/reports?reportId=${reportId}`)}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-left hover:bg-overlay/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info-solid/15 text-info">
                <Download className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <TruncateTooltip as="p" className="truncate text-sm font-semibold text-foreground" tooltip="Export Results">
                  Export Results
                </TruncateTooltip>
                <TruncateTooltip as="p" className="mt-0.5 truncate text-xs text-fg-muted" tooltip="Download in multiple formats">
                  Download in multiple formats
                </TruncateTooltip>
              </div>
            </button>

            {/* A superseded report is never rerun: the newer run is where changes continue. */}
            {report.supersededBy && (
              <button
                type="button"
                onClick={() => router.push(`/dashboard/reconciliation-process/${report.supersededBy?.id}`)}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-left hover:bg-overlay/5 sm:col-span-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-500/15 text-fg-secondary">
                  <History className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">Open latest run</p>
                  <p className="mt-0.5 truncate text-xs text-fg-muted">Superseded by {report.supersededBy.reference ?? 'a newer run'}</p>
                </div>
              </button>
            )}

            {canEdit && !report.supersededBy && (
              <button
                type="button"
                onClick={() => setIsRerunOpen(true)}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 text-left hover:bg-overlay/5 sm:col-span-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-indigo-solid/15 text-accent-indigo">
                  <RotateCcw className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">Rerun with changes</p>
                  <p className="mt-0.5 truncate text-xs text-fg-muted">New draft with these files, mapping and rules</p>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
      <RerunReportDialog open={isRerunOpen} onOpenChange={setIsRerunOpen} reportId={reportId} />
    </ScrollArea>
  )
}
