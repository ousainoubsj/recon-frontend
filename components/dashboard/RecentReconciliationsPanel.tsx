import Image from 'next/image'
import Link from 'next/link'
import { Eye } from 'lucide-react'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyReconciliations from '@/components/dashboard/EmptyReconciliations'
import PanelHeader from '@/components/dashboard/PanelHeader'
import { formatPercent } from '@/lib/format'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import type { Report } from '@/types/reports'

function fileIconSrc(filename: string | null) {
  const ext = filename?.split('.').pop()?.toLowerCase()
  return ext === 'xls' || ext === 'xlsx' ? '/icons/xls.png' : '/icons/csv.png'
}

export default function RecentReconciliationsPanel({ reports, isLoading }: { reports?: Report[]; isLoading?: boolean }) {
  const { formatDate, formatCurrency } = useOrgFormat()

  return (
    <div className="rounded-2xl border border-line bg-surface-sunken/50 p-4 lg:col-span-2">
      <PanelHeader title="Recent Reconciliations" viewAllHref="/dashboard/history" />

      <ScrollArea className="h-82 w-full">
        {isLoading || !reports ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-fg-soft">
                <th className="pb-3 pr-3 text-nowrap font-semibold">Date</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">File Pair</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">Match Rate</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">Break Value</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">Status</th>
                <th className="pb-3 text-nowrap font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i} className="border-t border-line-subtle">
                  <td className="py-2 pr-3 align-top">
                    <Skeleton className="mb-1.5 h-3 w-16" />
                    <Skeleton className="h-2.5 w-10" />
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 shrink-0 rounded" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <Skeleton className="h-3 w-10" />
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <Skeleton className="h-3 w-14" />
                  </td>
                  <td className="py-2 pr-3 align-top">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  <td className="py-2 align-top">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : reports.length === 0 ? (
          <EmptyReconciliations />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-fg-soft">
                <th className="pb-3 pr-3 text-nowrap font-semibold">Date</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">File Pair</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">Match Rate</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">Break Value</th>
                <th className="pb-3 pr-3 text-nowrap font-semibold">Status</th>
                <th className="pb-3 text-nowrap font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const matchRate = report.totalRows > 0 ? (report.matchedCount / report.totalRows) * 100 : 0
                const fileA = report.fileAName ?? 'Internal file'
                const fileB = report.fileBName ?? 'Counterparty file'
                return (
                  <tr key={report.id} className="border-t border-line-subtle">
                    <td className="py-2 pr-3 align-top">
                      <TruncateTooltip as="p" className="truncate text-fg-strong" tooltip={formatDate(report.runDate)}>
                        {formatDate(report.runDate)}
                      </TruncateTooltip>
                      <p className="text-xs text-fg-muted">
                        {new Date(report.runDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="py-2 pr-3 align-top">
                      <TruncateTooltip
                        as="span"
                        className="flex items-center gap-2 text-fg-strong truncate line-clamp-1"
                        tooltip={`${fileA} ↔ ${fileB}`}
                      >
                        <Image src={fileIconSrc(report.fileAName)} alt="" width={20} height={20} className="h-4 w-4 shrink-0" />
                        {fileA} ↔ {fileB}
                      </TruncateTooltip>
                    </td>
                    <td className="py-2 pr-3 align-top text-fg-strong">{formatPercent(matchRate)}</td>
                    <td className="py-2 pr-3 align-top text-fg-strong">{formatCurrency(report.totalBreakValue)}</td>
                    <td className="py-2 pr-3 align-top">
                      <span className="rounded-full bg-success-solid/15 px-2.5 py-1 text-xs font-medium text-success">
                        Completed
                      </span>
                    </td>
                    <td className="py-2 align-top">
                      <div className="flex items-center gap-3 text-fg-muted">
                        <Link
                          href={`/dashboard/reconciliation-process/${report.id}`}
                          aria-label="View"
                          className="cursor-pointer hover:text-foreground"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
