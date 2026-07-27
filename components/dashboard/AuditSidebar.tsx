'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, UserPlus, type LucideIcon } from 'lucide-react'
import type { ApexOptions } from 'apexcharts'
import { Skeleton } from '@/components/ui/skeleton'
import { actionDisplay, detailsForLog } from '@/lib/auditLogDisplay'
import { useAuditLogStats, useTopActions, useTopUsers } from '@/lib/hooks/useAuditLogs'
import { useReport } from '@/lib/hooks/useReports'
import { formatDateTime, formatReportReference } from '@/lib/format'
import type { AuditLog, AuditLogStatus, TopUser } from '@/types/auditLogs'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const STATUS_BADGE: Record<AuditLogStatus, string> = {
  success: 'bg-emerald-500/15 text-emerald-400',
  info: 'bg-sky-500/15 text-sky-400',
  warning: 'bg-amber-500/15 text-amber-400',
  failed: 'bg-rose-500/15 text-rose-400',
}
const STATUS_LABEL: Record<AuditLogStatus, string> = {
  success: 'Success',
  info: 'Info',
  warning: 'Warning',
  failed: 'Failed',
}

// Mirrors ChartsOverview.tsx's DonutChartSkeleton exactly (same ring-segment
// technique), recolored to match this donut's actual Successful/Failed/
// Warning/Info segments instead of that one's generic 4-color set.
function DonutChartSkeleton() {
  const circumference = 2 * Math.PI * 38
  const segments = [
    { color: '#34D399', portion: 0.6 },
    { color: '#60A5FA', portion: 0.15 },
    { color: '#FBBF24', portion: 0.15 },
    { color: '#FB7185', portion: 0.1 },
  ]
  let offset = 0
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full animate-pulse" style={{ animationDuration: '1.8s' }} aria-hidden="true">
      {segments.map(({ color, portion }) => {
        const length = portion * circumference
        const dashoffset = -offset
        offset += length
        return (
          <circle
            key={color}
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={color}
            strokeOpacity="0.3"
            strokeWidth="14"
            strokeDasharray={`${length} ${circumference}`}
            strokeDashoffset={dashoffset}
            transform="rotate(-90 50 50)"
          />
        )
      })}
    </svg>
  )
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// "Other Users" is a synthetic remainder bucket (no real user behind it) —
// gets its own icon regardless of the (always-null) image field.
function TopUserAvatar({ name, image }: Pick<TopUser, 'name' | 'image'>) {
  if (name === 'Other Users') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-600 text-slate-200">
        <UserPlus className="h-3.5 w-3.5" />
      </span>
    )
  }
  if (image) {
    return <Image src={image} alt={name} width={28} height={28} className="h-7 w-7 shrink-0 rounded-full object-cover" />
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-500 text-[11px] font-semibold text-white">
      {initials(name)}
    </span>
  )
}

type AuditSidebarProps = {
  selectedLog?: AuditLog | null
  isSelectedLogLoading?: boolean
  onViewAllActions?: () => void
}

export default function AuditSidebar({ selectedLog, isSelectedLogLoading, onViewAllActions }: AuditSidebarProps) {
  const { data: stats, isLoading: isStatsLoading } = useAuditLogStats()
  const { data: topActions, isLoading: isTopActionsLoading } = useTopActions()
  const { data: topUsers, isLoading: isTopUsersLoading } = useTopUsers()
  const { data: selectedReport } = useReport(
    selectedLog?.entityType === 'report' && selectedLog.entityId ? selectedLog.entityId : undefined,
  )

  const activitySegments = stats
    ? [
        { label: 'Successful', value: stats.byStatus.success, color: '#34D399' },
        { label: 'Failed', value: stats.byStatus.failed, color: '#FB7185' },
        { label: 'Warning', value: stats.byStatus.warning, color: '#FBBF24' },
        { label: 'Info', value: stats.byStatus.info, color: '#60A5FA' },
      ]
    : []

  const activityOptions: ApexOptions = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: activitySegments.map((s) => s.label),
    colors: activitySegments.map((s) => s.color),
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { show: false },
    plotOptions: { pie: { donut: { size: '72%' } } },
    tooltip: { theme: 'dark' },
  }

  const display = selectedLog ? actionDisplay(selectedLog) : null
  const details = selectedLog ? detailsForLog(selectedLog) : []
  const reference = selectedReport ? formatReportReference(selectedReport.sequenceYear, selectedReport.sequenceNumber) : null

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Activity Summary</h3>
          <span className="rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-1.5 text-sm text-slate-200">All Time</span>
        </div>

        {isStatsLoading || !stats ? (
          <div className="mt-5 flex items-center gap-4">
            <div className="relative mt-2 h-32 w-32 shrink-0">
              <DonutChartSkeleton />
            </div>
            <div className="min-w-0 flex-1 space-y-2.5">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-4">
            <div className="w-32 mt-5 shrink-0">
              <Chart options={activityOptions} series={activitySegments.map((s) => s.value)} type="donut" height={150} />
            </div>

            <ul className="min-w-0 flex-1 space-y-2.5">
              {activitySegments.map((seg) => (
                <li key={seg.label} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="truncate text-slate-300">{seg.label}</span>
                  </span>
                  <span className="shrink-0 text-slate-400">
                    {seg.value.toLocaleString()} ({stats.total > 0 ? ((seg.value / stats.total) * 100).toFixed(1) : '0.0'}%)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
        <h3 className="text-base font-semibold text-white">Log Details</h3>

        {isSelectedLogLoading ? (
          <>
            <div className="mt-4 flex items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="mt-4 space-y-2.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-24 shrink-0" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          </>
        ) : !selectedLog ? (
          <p className="mt-4 text-sm text-slate-400">Select an activity from the table to see its details.</p>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${display?.iconBg} ${display?.iconColor}`}>
                {display && <display.Icon className="h-4 w-4" />}
              </span>
              <p className="font-semibold text-white">{display?.title}</p>
            </div>

            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-24 shrink-0 text-slate-400">User</span>
                <span className="text-slate-200">{selectedLog.user?.name ?? 'System'}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-24 shrink-0 text-slate-400">Module</span>
                <span className="text-slate-200">{display?.module}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-24 shrink-0 text-slate-400">Time</span>
                <span className="text-slate-200">{formatDateTime(selectedLog.ts)}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-24 shrink-0 text-slate-400">IP Address</span>
                <span className="text-slate-200">{selectedLog.ip ?? '—'}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-24 shrink-0 text-slate-400">Status</span>
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[selectedLog.status]}`}>
                  {STATUS_LABEL[selectedLog.status]}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-24 shrink-0 text-slate-400">Details</span>
                <span className="text-slate-300">
                  {selectedReport ? (
                    <>
                      {selectedReport.name ?? 'Reconciliation'}
                      {reference && ` (ID: ${reference})`}
                    </>
                  ) : details.length > 0 ? (
                    details.join(' · ')
                  ) : (
                    '—'
                  )}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
        <h3 className="text-base font-semibold text-white">Top Users</h3>

        {isTopUsersLoading || !topUsers ? (
          <ul className="mt-4 space-y-3.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-3 w-10" />
              </li>
            ))}
          </ul>
        ) : topUsers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No activity yet.</p>
        ) : (
          <ul className="mt-4 space-y-3.5">
            {topUsers.map((user) => (
              <li key={user.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-slate-300">
                  <TopUserAvatar name={user.name} image={user.image} />
                  <span className="truncate">{user.name}</span>
                </span>
                <span className="shrink-0 font-medium text-white">{user.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}

        <Link href="/dashboard/team" className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-400 hover:underline">
          View All Users
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-4">
        <h3 className="text-base font-semibold text-white">Top Actions</h3>

        {isTopActionsLoading || !topActions ? (
          <ul className="mt-4 space-y-3.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 shrink-0 rounded" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-3 w-10" />
              </li>
            ))}
          </ul>
        ) : topActions.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">No activity yet.</p>
        ) : (
          <ul className="mt-4 space-y-3.5">
            {topActions.map((action) => {
              const { title, Icon }: { title: string; Icon: LucideIcon } = actionDisplay({ action: action.label, metadata: null })
              return (
                <li key={action.label} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2 text-slate-300">
                    <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="truncate">{title}</span>
                  </span>
                  <span className="shrink-0 font-medium text-white">{action.count.toLocaleString()}</span>
                </li>
              )
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={onViewAllActions}
          className="mt-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-indigo-400 hover:underline"
        >
          View All Actions
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
