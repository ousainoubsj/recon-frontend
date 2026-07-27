'use client'

import { ArrowUp, ArrowDown, Activity, ShieldCheck, AlertTriangle, Users, type LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { formatNumber, formatPercent } from '@/lib/format'
import { useAuditLogStats } from '@/lib/hooks/useAuditLogs'
import type { AuditLogStats } from '@/types/auditLogs'

type Sub = { kind: 'trend'; value: string; isGood: boolean } | { kind: 'plain'; text: string; colorClassName: string }

const CARD_DEFS: {
  label: string
  Icon: LucideIcon
  gradient: string
  glow: string
  skeletonColors: [string, string, string]
  value: (s: AuditLogStats) => number
  sub: (s: AuditLogStats) => Sub
}[] = [
  {
    label: 'Total Activities',
    Icon: Activity,
    gradient: 'from-violet-300 via-violet-500 to-violet-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(139,92,246,0.55)]',
    skeletonColors: ['#C4B5FD', '#8B5CF6', '#6D28D9'],
    value: (s) => s.total,
    sub: (s) =>
      s.totalTrendPercent == null
        ? { kind: 'plain', text: 'No prior-period data yet', colorClassName: 'text-slate-400' }
        : { kind: 'trend', value: formatPercent(Math.abs(s.totalTrendPercent), 1), isGood: s.totalTrendPercent >= 0 },
  },
  {
    label: 'Successful Activities',
    Icon: ShieldCheck,
    gradient: 'from-emerald-300 via-emerald-500 to-emerald-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(16,185,129,0.55)]',
    skeletonColors: ['#6EE7B7', '#10B981', '#047857'],
    value: (s) => s.byStatus.success,
    sub: (s) => ({
      kind: 'plain',
      text: `${s.total > 0 ? formatPercent((s.byStatus.success / s.total) * 100, 1) : '—'} of total`,
      colorClassName: 'text-slate-400',
    }),
  },
  {
    label: 'Failed Activities',
    Icon: AlertTriangle,
    gradient: 'from-amber-300 via-amber-500 to-amber-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(245,158,11,0.55)]',
    skeletonColors: ['#FCD34D', '#F59E0B', '#B45309'],
    value: (s) => s.byStatus.failed,
    sub: (s) => ({
      kind: 'plain',
      text: `${s.total > 0 ? formatPercent((s.byStatus.failed / s.total) * 100, 1) : '—'} of total`,
      colorClassName: 'text-rose-400',
    }),
  },
  {
    label: 'Unique Users',
    Icon: Users,
    gradient: 'from-sky-300 via-sky-500 to-sky-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(14,165,233,0.55)]',
    skeletonColors: ['#7DD3FC', '#0EA5E9', '#0369A1'],
    value: (s) => s.uniqueUsers,
    sub: (s) => ({ kind: 'trend', value: String(Math.abs(s.uniqueUsersTrend)), isGood: s.uniqueUsersTrend >= 0 }),
  },
]

function StatBadgeSkeleton({ label, colors }: { label: string; colors: readonly [string, string, string] }) {
  const gradientId = `audit-stat-skeleton-${label.replace(/\s+/g, '-').toLowerCase()}`
  return (
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/10">
      <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full animate-pulse" style={{ animationDuration: '1.8s' }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors[0]} stopOpacity="0.4" />
            <stop offset="55%" stopColor={colors[1]} stopOpacity="0.35" />
            <stop offset="100%" stopColor={colors[2]} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="28" cy="28" r="28" fill={`url(#${gradientId})`} />
      </svg>
      <span className="pointer-events-none absolute -top-3 left-1/2 h-8 w-10 -translate-x-1/2 rounded-full bg-white/10 blur-md" />
      <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-t from-black/20 via-transparent to-transparent" />
    </span>
  )
}

export default function AuditStats() {
  const { data: stats, isLoading } = useAuditLogStats()

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARD_DEFS.map((card) => (
          <div key={card.label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 p-3">
            <StatBadgeSkeleton label={card.label} colors={card.skeletonColors} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_DEFS.map(({ label, Icon, gradient, glow, value, sub }) => {
        const s = sub(stats)
        return (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 p-3">
            <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/15 ${glow}`}>
              <span className={`pointer-events-none absolute inset-0 rounded-full bg-linear-to-br ${gradient} opacity-30`} />
              <span className="pointer-events-none absolute -top-3 left-1/2 h-8 w-10 -translate-x-1/2 rounded-full bg-white/30 blur-md" />
              <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-t from-black/20 via-transparent to-transparent" />
              <Icon className="relative h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <TruncateTooltip as="p" className="truncate text-sm text-slate-300" tooltip={label}>
                {label}
              </TruncateTooltip>
              <TruncateTooltip as="p" className="truncate text-2xl font-bold text-white" tooltip={formatNumber(value(stats))}>
                {formatNumber(value(stats))}
              </TruncateTooltip>
              {s.kind === 'trend' ? (
                <p className="flex items-center gap-1 text-xs font-medium">
                  {s.isGood ? (
                    <ArrowUp className="h-3 w-3 shrink-0 text-emerald-400" />
                  ) : (
                    <ArrowDown className="h-3 w-3 shrink-0 text-rose-400" />
                  )}
                  <TruncateTooltip as="span" className="min-w-0 truncate" tooltip={`${s.value} vs last 30 days`}>
                    <span className={s.isGood ? 'text-emerald-400' : 'text-rose-400'}>{s.value}</span>{' '}
                    <span className="text-slate-400">vs last 30 days</span>
                  </TruncateTooltip>
                </p>
              ) : (
                <TruncateTooltip as="p" className={`truncate text-xs font-medium ${s.colorClassName}`} tooltip={s.text}>
                  {s.text}
                </TruncateTooltip>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
