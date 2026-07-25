import Image from 'next/image'
import Link from 'next/link'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowUpRight,
  Bell,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  LayoutGrid,
  Mail,
  Plus,
  Upload,
  User,
  type LucideIcon,
} from 'lucide-react'
import { formatCurrency, formatPercent, formatRelativeTime, formatDate } from '@/lib/format'
import type { Report } from '@/types/reports'
import type { AuditLog } from '@/types/auditLogs'

type ActivityOverviewProps = {
  reports?: Report[]
  isReportsLoading?: boolean
  activity?: AuditLog[]
  isActivityLoading?: boolean
}

function fileIconSrc(filename: string | null) {
  const ext = filename?.split('.').pop()?.toLowerCase()
  return ext === 'xls' || ext === 'xlsx' ? '/icons/xls.png' : '/icons/csv.png'
}

const ACTIVITY_DISPLAY: Record<string, { title: string; Icon: LucideIcon; tint: string }> = {
  'report.create': { title: 'Reconciliation completed', Icon: FileText, tint: 'bg-blue-500 text-white' },
  'report.run.completed': { title: 'Reconciliation completed', Icon: FileText, tint: 'bg-blue-500 text-white' },
  'report.export': { title: 'Report exported', Icon: FileSpreadsheet, tint: 'bg-emerald-500 text-white' },
  'report.email': { title: 'Report emailed', Icon: Mail, tint: 'bg-indigo-500 text-white' },
  'file.upload_initiated': { title: 'File uploaded', Icon: Upload, tint: 'bg-blue-500 text-white' },
  'auth.login': { title: 'User login', Icon: User, tint: 'bg-slate-500 text-white' },
  'settings.organization_info.update': { title: 'Updated organization information', Icon: LayoutGrid, tint: 'bg-orange-500 text-white' },
  'settings.reconciliation_defaults.update': { title: 'Updated reconciliation defaults', Icon: FileText, tint: 'bg-fuchsia-500 text-white' },
  'settings.notifications.update': { title: 'Updated notification settings', Icon: Bell, tint: 'bg-amber-500 text-white' },
}

// 'organization.update' (Better Auth's own hook) covers both a name change
// and a logo change — same metadata-based disambiguation as
// SettingsRecentActivity.tsx's displayForLog, kept in sync with it.
const ORG_UPDATE_NAME_DISPLAY = { title: 'Updated organization profile', Icon: LayoutGrid, tint: 'bg-orange-500 text-white' }
const ORG_UPDATE_LOGO_DISPLAY = { title: 'Updated organization logo', Icon: ImageIcon, tint: 'bg-emerald-500 text-white' }

function humanizeAction(action: string) {
  return action.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function activityDisplay(log: AuditLog) {
  if (log.action === 'organization.update') {
    const hasLogo = !!log.metadata && typeof log.metadata === 'object' && 'logo' in log.metadata
    return hasLogo ? ORG_UPDATE_LOGO_DISPLAY : ORG_UPDATE_NAME_DISPLAY
  }
  return ACTIVITY_DISPLAY[log.action] ?? { title: humanizeAction(log.action), Icon: FileText, tint: 'bg-slate-500 text-white' }
}

function EmptyReconciliations() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 py-6 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyReconGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#1CEAEA" />
          </linearGradient>
        </defs>
        <g transform="rotate(-8 30 40)">
          <rect x="12" y="14" width="36" height="48" rx="6" fill="#111A33" stroke="#232D47" strokeWidth="1.5" />
          <rect x="19" y="24" width="22" height="3" rx="1.5" fill="#3A4568" />
          <rect x="19" y="32" width="18" height="3" rx="1.5" fill="#2C3654" />
          <rect x="19" y="40" width="22" height="3" rx="1.5" fill="#2C3654" />
          <rect x="19" y="48" width="14" height="3" rx="1.5" fill="#2C3654" />
        </g>
        <g transform="rotate(8 82 40)">
          <rect x="64" y="10" width="36" height="48" rx="6" fill="#0D152A" stroke="#1CEAEA" strokeOpacity="0.35" strokeWidth="1.5" />
          <rect x="71" y="20" width="22" height="3" rx="1.5" fill="#1CEAEA" fillOpacity="0.5" />
          <rect x="71" y="28" width="18" height="3" rx="1.5" fill="#2C3654" />
          <rect x="71" y="36" width="22" height="3" rx="1.5" fill="#2C3654" />
          <rect x="71" y="44" width="14" height="3" rx="1.5" fill="#2C3654" />
        </g>
        <circle cx="56" cy="66" r="16" fill="#0A1128" stroke="#232D47" strokeWidth="1.5" />
        <path
          d="M49 66.5 L53.5 71 L63.5 61"
          stroke="url(#emptyReconGlow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div>
        <p className="text-sm font-medium text-slate-200">No reconciliations yet</p>
        <p className="mt-1 text-xs text-slate-400">Run your first reconciliation to see results here.</p>
      </div>
      <Link
        href="/dashboard/reconcile?upload=1"
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0D152A] px-3 py-1.5 text-xs font-medium text-[#1CEAEA] transition-all duration-300 hover:border-[#1CEAEA]/40 active:scale-95"
      >
        <Plus className="h-3.5 w-3.5" />
        Start Reconciliation
      </Link>
    </div>
  )
}

function PanelHeader({ title, viewAllHref }: { title: string; viewAllHref?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#232D47] bg-[#0D152A] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors duration-300 hover:text-white"
        >
          View All
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

export default function ActivityOverview({
  reports,
  isReportsLoading,
  activity,
  isActivityLoading,
}: ActivityOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-4 lg:col-span-2">
        <PanelHeader title="Recent Reconciliations" viewAllHref="/dashboard/history" />

        <ScrollArea className="h-82 w-full">
          {isReportsLoading || !reports ? (
            <div className="space-y-3 pt-1">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <EmptyReconciliations />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#9EA7C1]">
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
                    <tr key={report.id} className="border-t border-[#1B2540]">
                      <td className="py-2 pr-3 align-top">
                        <TruncateTooltip as="p" className="truncate text-slate-200" tooltip={formatDate(report.runDate)}>
                          {formatDate(report.runDate)}
                        </TruncateTooltip>
                        <p className="text-xs text-slate-400">
                          {new Date(report.runDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="py-2 pr-3 align-top">
                        <TruncateTooltip
                          as="span"
                          className="flex items-center gap-2 text-slate-200 truncate line-clamp-1"
                          tooltip={`${fileA} ↔ ${fileB}`}
                        >
                          <Image src={fileIconSrc(report.fileAName)} alt="" width={20} height={20} className="h-4 w-4 shrink-0" />
                          {fileA} ↔ {fileB}
                        </TruncateTooltip>
                      </td>
                      <td className="py-2 pr-3 align-top text-slate-200">{formatPercent(matchRate)}</td>
                      <td className="py-2 pr-3 align-top text-slate-200">{formatCurrency(report.totalBreakValue)}</td>
                      <td className="py-2 pr-3 align-top">
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                          Completed
                        </span>
                      </td>
                      <td className="py-2 align-top">
                        <div className="flex items-center gap-3 text-slate-400">
                          <button type="button" aria-label="View" className="cursor-pointer hover:text-white">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button type="button" aria-label="Download" className="cursor-pointer hover:text-white">
                            <Download className="h-4 w-4" />
                          </button>
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

      <div className="rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-4">
        <PanelHeader title="Recent Activity" viewAllHref="/dashboard/audit-log" />

        <ScrollArea className="h-82 w-full">
          {isActivityLoading || !activity ? (
            <div className="space-y-3 pt-1">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-[#1B2540]">
              {activity.map((log) => {
                const { title, Icon, tint } = activityDisplay(log)
                const subtitle = log.user?.name ?? log.user?.email ?? 'System'
                return (
                  <li key={log.id} className="flex items-start gap-3 py-3 first:pt-1">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tint}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <TruncateTooltip as="p" className="truncate text-sm text-slate-200" tooltip={title}>
                        {title}
                      </TruncateTooltip>
                      <TruncateTooltip as="p" className="truncate text-xs text-slate-400" tooltip={subtitle}>
                        {subtitle}
                      </TruncateTooltip>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-xs text-slate-400">{formatRelativeTime(log.ts)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
