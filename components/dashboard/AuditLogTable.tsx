'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Cog,
  MoreHorizontal,
  MoreVertical,
  Search,
  Tag,
  type LucideIcon,
} from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Menu } from '@base-ui/react/menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuditLogs } from '@/lib/hooks/useAuditLogs'
import { useTeamMembers } from '@/lib/hooks/useTeam'
import { actionDisplay, detailsForLog, MODULE_ACTIONS, MODULE_BADGE_CLASSNAME, MODULES, type ModuleName } from '@/lib/auditLogDisplay'
import { getPageItems } from '@/lib/pagination'
import { ROLE_LABELS } from '@/types/team'
import type { AuditLog, AuditLogStatus } from '@/types/auditLogs'

const PAGE_SIZE = 10
// No count-with-filters endpoint exists server-side (audit logs can genuinely
// number in the thousands) — same tradeoff already accepted for Team: fetch a
// generous capped, filtered set in one shot and paginate client-side over it.
const FETCH_CAP = 200

// Box-shadow only, not border-color — avoids competing with the static
// border-[#232D47] utility for the same CSS property at the same specificity.
const HIGHLIGHT_CLASSES = ['shadow-[0_0_0_3px_rgba(28,234,234,0.5)]']

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

function UserAvatar({ log }: { log: AuditLog }) {
  if (log.user?.image) {
    return <Image src={log.user.image} alt={log.user.name} width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
  }
  if (!log.userId || !log.user) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-600 text-slate-200">
        <Cog className="h-4 w-4" />
      </span>
    )
  }
  const initials = log.user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-500 text-xs font-semibold text-white">
      {initials}
    </span>
  )
}

function EmptyAuditLog() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptyAuditGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#1CEAEA" />
          </linearGradient>
        </defs>
        <rect x="14" y="8" width="70" height="60" rx="8" fill="#111A33" stroke="#232D47" strokeWidth="1.5" />
        <circle cx="24" cy="22" r="4" fill="#2C3654" />
        <rect x="34" y="19.5" width="40" height="3" rx="1.5" fill="#3A4568" />
        <rect x="34" y="26" width="26" height="2.5" rx="1.25" fill="#2C3654" />
        <circle cx="24" cy="38" r="4" fill="#1CEAEA" fillOpacity="0.5" />
        <rect x="34" y="35.5" width="34" height="3" rx="1.5" fill="#2C3654" />
        <rect x="34" y="42" width="22" height="2.5" rx="1.25" fill="#2C3654" />
        <circle cx="24" cy="54" r="4" fill="#2C3654" />
        <rect x="34" y="51.5" width="40" height="3" rx="1.5" fill="#2C3654" />
        <rect x="34" y="58" width="18" height="2.5" rx="1.25" fill="#2C3654" />
        <circle cx="80" cy="66" r="16" fill="#0A1128" stroke="#232D47" strokeWidth="1.5" />
        <circle cx="80" cy="66" r="8" stroke="url(#emptyAuditGlow)" strokeWidth="2" fill="none" />
        <path d="M80 61v5l3.5 2.5" stroke="url(#emptyAuditGlow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <div>
        <p className="text-sm font-medium text-slate-200">No activity matches these filters</p>
        <p className="mt-1 text-xs text-slate-400">Try a different search term or clear the module/user/date filters.</p>
      </div>
    </div>
  )
}

type AuditLogTableProps = {
  onSelectLog?: (log: AuditLog) => void
  // Bumped by the sidebar's "View All Actions" link — there's no separate
  // "all actions" page, so it scrolls to and briefly highlights this table
  // instead of navigating anywhere.
  highlightSignal?: number
  // Seeded from the URL by AuditLogPageClient when arriving via a deep-link
  // (e.g. SettingsRecentActivity's per-row action) — narrows the filters so
  // the target log is virtually guaranteed to be inside the FETCH_CAP window
  // and auto-selects the page it's on.
  initialModuleFilter?: ModuleName | 'all'
  initialDateRange?: DateRange
  highlightLogId?: string
}

export default function AuditLogTable({
  onSelectLog,
  highlightSignal,
  initialModuleFilter,
  initialDateRange,
  highlightLogId,
}: AuditLogTableProps) {
  const [q, setQ] = useState('')
  const [moduleFilter, setModuleFilter] = useState<ModuleName | 'all'>(initialModuleFilter ?? 'all')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange)
  const [page, setPage] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Direct DOM manipulation rather than a boolean + setState — this is a
  // one-off imperative "flash" triggered by an external signal, not state
  // React needs to re-render around, so there's nothing to derive/store.
  useEffect(() => {
    if (!highlightSignal) return
    const el = containerRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    el.classList.add(...HIGHLIGHT_CLASSES)
    const timer = setTimeout(() => el.classList.remove(...HIGHLIGHT_CLASSES), 1500)
    return () => clearTimeout(timer)
  }, [highlightSignal])

  const { data: members } = useTeamMembers({ limit: 100 })
  const roleByUserId = new Map(members?.map((m) => [m.userId, m.role]) ?? [])

  const { data: logs, isLoading } = useAuditLogs({
    q: q.trim() || undefined,
    action: moduleFilter === 'all' ? undefined : MODULE_ACTIONS[moduleFilter],
    userId: userFilter === 'all' ? undefined : userFilter,
    dateFrom: dateRange?.from?.toISOString(),
    dateTo: dateRange?.to?.toISOString(),
    limit: FETCH_CAP,
  })

  const rows = logs ?? []
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pagedRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const resetToFirstPage = () => setPage(1)

  // Jumps to whichever page the deep-linked log actually falls on, the moment
  // `logs` finishes loading — an in-render state adjustment (guarded by
  // comparing against the previous `logs` reference) rather than a
  // useEffect+setState pair, since this is reacting to freshly-arrived data,
  // not an external system. jumpedToHighlightId (plain state, not a ref —
  // refs can't be read/written during render either) additionally guards
  // against re-jumping after the user has manually paged away.
  const [lastProcessedLogs, setLastProcessedLogs] = useState(logs)
  const [jumpedToHighlightId, setJumpedToHighlightId] = useState<string | undefined>(undefined)
  if (logs !== lastProcessedLogs) {
    setLastProcessedLogs(logs)
    if (highlightLogId && logs && jumpedToHighlightId !== highlightLogId) {
      const index = rows.findIndex((log) => log.id === highlightLogId)
      if (index !== -1) {
        setJumpedToHighlightId(highlightLogId)
        setPage(Math.ceil((index + 1) / PAGE_SIZE))
        // Also drives the parent's sidebar selection — matches how clicking a
        // row selects it, so a deep-link shows the same detail panel with no
        // separate fetch needed.
        onSelectLog?.(rows[index])
      }
    }
  }

  // Scrolls to and briefly flashes the specific deep-linked row, once it's
  // actually rendered on the current page.
  useEffect(() => {
    if (!highlightLogId) return
    const el = document.getElementById(`audit-row-${highlightLogId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add(...HIGHLIGHT_CLASSES)
    const timer = setTimeout(() => el.classList.remove(...HIGHLIGHT_CLASSES), 1500)
    return () => clearTimeout(timer)
  }, [highlightLogId, pagedRows])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              resetToFirstPage()
            }}
            placeholder="Search by user, action, module..."
            className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />
        </div>

        <Select
          value={moduleFilter}
          onValueChange={(value) => {
            setModuleFilter(value as ModuleName | 'all')
            resetToFirstPage()
          }}
          items={{ all: 'All Modules', ...Object.fromEntries(MODULES.map((m) => [m, m])) }}
        >
          <SelectTrigger className="h-9! w-fit cursor-pointer border-[#232D47] bg-[#0A1128] text-sm text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {MODULES.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={userFilter}
          onValueChange={(value) => {
            setUserFilter(value ?? 'all')
            resetToFirstPage()
          }}
          items={{ all: 'All Users', ...Object.fromEntries((members ?? []).map((m) => [m.userId, m.user.name])) }}
        >
          <SelectTrigger className="h-9! w-fit cursor-pointer border-[#232D47] bg-[#0A1128] text-sm text-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {members?.map((m) => (
              <SelectItem key={m.userId} value={m.userId}>
                {m.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DateRangePicker
          value={dateRange}
          onChange={(value) => {
            setDateRange(value)
            resetToFirstPage()
          }}
        />
      </div>

      <div
        ref={containerRef}
        className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-4 transition-shadow duration-500"
      >
        <ScrollArea className="min-w-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4 text-nowrap font-semibold">
                  <span className="flex items-center gap-1">
                    Time
                    <ChevronsUpDown className="h-3 w-3" />
                  </span>
                </th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">User</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Action</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Module</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Details</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">IP Address</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Status</th>
                <th className="pb-3 text-nowrap font-semibold" />
              </tr>
            </thead>
            <tbody>
              {isLoading || !logs ? (
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                  <tr key={i} className="border-t border-[#1B2540]">
                    <td className="py-3 pr-4 align-top">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-2.5 w-14" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-2.5 w-14" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <Skeleton className="h-3 w-32" />
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <Skeleton className="h-5 w-24 rounded-md" />
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <Skeleton className="h-3 w-36" />
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <Skeleton className="h-3 w-20" />
                    </td>
                    <td className="py-3 pr-4 align-top">
                      <Skeleton className="h-5 w-16 rounded-md" />
                    </td>
                    <td className="py-3 align-top">
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                  </tr>
                ))
              ) : pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyAuditLog />
                  </td>
                </tr>
              ) : (
                pagedRows.map((log) => {
                  const display = actionDisplay(log)
                  const Icon: LucideIcon = display.Icon
                  const date = new Date(log.ts)
                  const role = log.userId ? roleByUserId.get(log.userId) : undefined
                  const details = detailsForLog(log)
                  return (
                    <tr
                      key={log.id}
                      id={`audit-row-${log.id}`}
                      onClick={() => onSelectLog?.(log)}
                      className="cursor-pointer border-t border-[#1B2540] hover:bg-white/3 transition-shadow duration-500"
                    >
                      <td className="py-3 pr-4 align-top">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${display.iconBg} ${display.iconColor}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="text-nowrap">
                            <p className="text-slate-200">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-slate-400">
                              {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-40 py-3 pr-4 align-top">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar log={log} />
                          <div className="min-w-0">
                            <TruncateTooltip as="p" className="truncate font-medium text-white" tooltip={log.user?.name ?? 'System'}>
                              {log.user?.name ?? 'System'}
                            </TruncateTooltip>
                            <p className="text-xs text-slate-400">{role ? ROLE_LABELS[role] : log.user ? '—' : 'System'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-36 py-3 pr-4 align-center">
                        <TruncateTooltip as="p" className="truncate text-slate-200" tooltip={display.title}>
                          {display.title}
                        </TruncateTooltip>
                      </td>
                      <td className="py-3 pr-4 align-center">
                        <span className={`inline-flex items-center gap-1 text-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${MODULE_BADGE_CLASSNAME[display.module]}`}>
                          <Tag className="h-3 w-3" />
                          {display.module}
                        </span>
                      </td>
                      <td className="max-w-42 py-3 pr-4 align-center">
                        {details.length === 0 ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          details.slice(0, 2).map((line) => (
                            <p key={line} className="truncate text-slate-300">
                              {line}
                            </p>
                          ))
                        )}
                      </td>
                      <td className="py-3 pr-4 align-center text-nowrap text-slate-300">{log.ip ?? '—'}</td>
                      <td className="py-3 pr-4 align-center">
                        <span className={`inline-block text-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[log.status]}`}>
                          {STATUS_LABEL[log.status]}
                        </span>
                      </td>
                      <td className="py-3 align-center" onClick={(e) => e.stopPropagation()}>
                        <Menu.Root>
                          <Menu.Trigger aria-label="More actions" className="cursor-pointer text-slate-400 outline-none hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Menu.Trigger>
                          <Menu.Portal>
                            <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50">
                              <Menu.Popup className="min-w-36 rounded-lg border border-[#232D47] bg-[#0A1128] shadow-lg shadow-black/40 outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0">
                                <Menu.Item
                                  onClick={() => onSelectLog?.(log)}
                                  className="flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-slate-200 outline-none transition-colors duration-300 data-highlighted:bg-white/5 data-highlighted:text-white"
                                >
                                  View Details
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

        <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-[#232D47] pt-3">
          <p className="text-sm text-slate-400">
            Showing {pagedRows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to {(safePage - 1) * PAGE_SIZE + pagedRows.length} of{' '}
            {rows.length} activities
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
              className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {getPageItems(safePage, totalPages).map((item, i) =>
              item === '...' ? (
                <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-slate-500">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPage(item)}
                  className={`h-8 w-8 cursor-pointer rounded-md text-sm font-medium ${
                    safePage === item ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/5'
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
              className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <span className="rounded-md border border-[#232D47] px-3 py-1.5 text-sm text-slate-300">{PAGE_SIZE} / page</span>
        </div>
      </div>
    </div>
  )
}
