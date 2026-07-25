'use client'

import Link from 'next/link'
import { ArrowRight, Bell, FileText, Image as ImageIcon, LayoutGrid, MoreVertical, type LucideIcon } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { formatDateTime } from '@/lib/format'
import { useAuditLogs } from '@/lib/hooks/useAuditLogs'
import type { AuditLog } from '@/types/auditLogs'

const SETTINGS_ACTION_DISPLAY: Record<string, { title: string; setting: string; Icon: LucideIcon; iconBg: string; iconColor: string }> = {
  'settings.organization_info.update': {
    title: 'Updated organization information',
    setting: 'General Settings',
    Icon: LayoutGrid,
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-400',
  },
  'settings.reconciliation_defaults.update': {
    title: 'Updated reconciliation defaults',
    setting: 'Reconciliation Settings',
    Icon: FileText,
    iconBg: 'bg-fuchsia-500/15',
    iconColor: 'text-fuchsia-400',
  },
  'settings.notifications.update': {
    title: 'Updated notification settings',
    setting: 'Notifications',
    Icon: Bell,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
  },
}

// 'organization.update' (Better Auth's own hook) covers both a name change
// and a logo change, and is the one that reflects a *completed* change — the
// presign step that precedes a logo upload is deliberately left out of this
// panel entirely (it only means "requested an upload URL", not "logo
// changed", and would otherwise show as a second, redundant row alongside
// this one). Pick the image icon specifically when the diff touched the logo.
const ORG_UPDATE_NAME_DISPLAY = {
  title: 'Updated organization profile',
  setting: 'General Settings',
  Icon: LayoutGrid,
  iconBg: 'bg-orange-500/15',
  iconColor: 'text-orange-400',
}
const ORG_UPDATE_LOGO_DISPLAY = {
  title: 'Updated organization logo',
  setting: 'General Settings',
  Icon: ImageIcon,
  iconBg: 'bg-emerald-500/15',
  iconColor: 'text-emerald-400',
}

function displayForLog(log: AuditLog) {
  if (log.action === 'organization.update') {
    const hasLogo = !!log.metadata && typeof log.metadata === 'object' && 'logo' in log.metadata
    return hasLogo ? ORG_UPDATE_LOGO_DISPLAY : ORG_UPDATE_NAME_DISPLAY
  }
  return (
    SETTINGS_ACTION_DISPLAY[log.action] ?? {
      title: log.action,
      setting: 'Settings',
      Icon: FileText,
      iconBg: 'bg-slate-500/15',
      iconColor: 'text-slate-400',
    }
  )
}

// Covers both metadata shapes a settings-related log can carry:
// - our own settingsService.js diffs: { changes: { field: { from, to } } }
// - Better Auth's '/organization/update' hook: { field: value } (no "from")
const FIELD_LABELS: Record<string, string> = {
  orgType: 'Organization Type',
  country: 'Country',
  timezone: 'Timezone',
  dateFormat: 'Date Format',
  currency: 'Currency',
  defaultAmountTolerance: 'Match Tolerance',
  defaultDateToleranceDays: 'Date Tolerance',
  defaultAmountType: 'Amount Type',
  emailNotificationsEnabled: 'Email Notifications',
  weeklyDigestEnabled: 'Weekly Digest',
  name: 'Name',
  logo: 'Logo',
}

function formatFieldValue(field: string, value: unknown) {
  if (value == null) return 'None'
  if (typeof value === 'boolean') return value ? 'On' : 'Off'
  if (field === 'defaultAmountTolerance') return `${value}%`
  if (field === 'defaultDateToleranceDays') return `${value} days`
  return String(value)
}

function describeMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata) return null

  const changes = metadata.changes
  if (changes && typeof changes === 'object') {
    const parts = Object.entries(changes as Record<string, { from: unknown; to: unknown }>).map(
      ([field, { from, to }]) =>
        `${FIELD_LABELS[field] ?? field}: ${formatFieldValue(field, from)} → ${formatFieldValue(field, to)}`,
    )
    return parts.length > 0 ? parts.join(' · ') : null
  }

  const parts = Object.entries(metadata)
    .filter(([field]) => field in FIELD_LABELS)
    .map(([field, value]) => `${FIELD_LABELS[field]}: ${formatFieldValue(field, value)}`)
  return parts.length > 0 ? parts.join(' · ') : null
}

function truncateName(name: string) {
  return name.length > 11 ? `${name.slice(0, 11)}.` : name
}

const AVATAR_COLORS = ['bg-teal-500', 'bg-slate-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500']

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || '?'
}

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
}

// Every action this panel knows how to display, in one place — also used as
// the exact filter sent to GET /audit-logs, so "5 most recent" means the 5
// most recent settings-scoped entries specifically, not 5 out of whatever
// window of overall org activity happened to be fetched. 'organization.update'
// isn't a key of SETTINGS_ACTION_DISPLAY (its display depends on metadata,
// see displayForLog) but still belongs in the filter.
const SETTINGS_ACTIONS = [...Object.keys(SETTINGS_ACTION_DISPLAY), 'organization.update']

function EmptySettingsActivity() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <svg width="112" height="88" viewBox="0 0 112 88" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="emptySettingsGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#1CEAEA" />
          </linearGradient>
        </defs>
        <rect x="18" y="10" width="62" height="58" rx="8" fill="#111A33" stroke="#232D47" strokeWidth="1.5" />
        <rect x="28" y="24" width="22" height="3" rx="1.5" fill="#3A4568" />
        <rect x="62" y="21" width="14" height="8" rx="4" fill="#1CEAEA" fillOpacity="0.6" />
        <rect x="28" y="40" width="26" height="3" rx="1.5" fill="#2C3654" />
        <rect x="62" y="37" width="14" height="8" rx="4" fill="#2C3654" />
        <rect x="28" y="56" width="18" height="3" rx="1.5" fill="#2C3654" />
        <rect x="62" y="53" width="14" height="8" rx="4" fill="#1CEAEA" fillOpacity="0.6" />
        <circle cx="80" cy="66" r="16" fill="#0A1128" stroke="#232D47" strokeWidth="1.5" />
        <circle cx="80" cy="66" r="8" stroke="url(#emptySettingsGlow)" strokeWidth="2" fill="none" />
        <path
          d="M80 61v5l3.5 2.5"
          stroke="url(#emptySettingsGlow)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div>
        <p className="text-sm font-medium text-slate-200">No settings changes yet</p>
        <p className="mt-1 text-xs text-slate-400">Changes made to organization settings will show up here.</p>
      </div>
    </div>
  )
}

export default function SettingsRecentActivity() {
  const { data: logs, isLoading } = useAuditLogs({ action: SETTINGS_ACTIONS, limit: 5 })
  const rows = logs ?? []

  return (
    <div className="min-w-0 rounded-2xl border border-[#232D47] bg-[#0A1121]/60 p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Recent System Activity</h3>
          <p className="mt-1 text-sm text-slate-400">Latest changes made to system settings.</p>
        </div>
        <Link href="/dashboard/audit-log" className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:underline">
          View All Activity
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <ScrollArea className="mt-3 min-w-0">
        {isLoading || !logs ? (
          <div className="space-y-3 pt-1">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptySettingsActivity />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="pb-3 pr-4 text-nowrap font-semibold">Action</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Setting</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Changed By</th>
                <th className="pb-3 pr-4 text-nowrap font-semibold">Date &amp; Time</th>
                <th className="pb-3 text-nowrap font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rows.map((log) => {
                const display = displayForLog(log)
                const changedBy = log.user?.name ?? log.user?.email ?? 'System'
                const detail = describeMetadata(log.metadata)

                return (
                  <tr key={log.id} className="border-t border-[#1B2540]">
                    <td className="py-3 pr-4 align-top">
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${display.iconBg} ${display.iconColor}`}>
                          <display.Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 max-w-51">
                          <p className="text-nowrap text-slate-200">{display.title}</p>
                          {detail && (
                            <TruncateTooltip as="p" className="truncate text-xs text-slate-500" tooltip={detail}>
                              {detail}
                            </TruncateTooltip>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 align-center text-nowrap text-slate-300">{display.setting}</td>
                    <td className="py-3 pr-4 align-center">
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${avatarColor(changedBy)}`}
                        >
                          {initials(changedBy)}
                        </span>
                        <TruncateTooltip as="span" className="text-nowrap text-slate-300" tooltip={changedBy}>
                          {truncateName(changedBy)}
                        </TruncateTooltip>
                      </div>
                    </td>
                    <td className="py-3 pr-4 align-center text-nowrap text-slate-300">{formatDateTime(log.ts)}</td>
                    <td className="py-3 align-center">
                      <button type="button" aria-label="More actions" className="cursor-pointer text-slate-400 hover:text-white">
                        <MoreVertical className="h-4 w-4" />
                      </button>
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
