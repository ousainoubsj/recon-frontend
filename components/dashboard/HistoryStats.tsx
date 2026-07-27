import { ArrowDown, ArrowUp, GitCompareArrows, Percent, Banknote, Receipt } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format'
import type { HistoryStats as HistoryStatsData } from '@/types/reports'

type HistoryStatsProps = {
  stats?: HistoryStatsData
  isLoading?: boolean
}

// "Lower is better" for Total Break Value, same convention as StatsOverview
// on the Dashboard Home — the arrow still reflects the real direction of
// change, but the color reflects whether that change is good or bad for
// that specific metric.
const CARD_DEFS = [
  {
    label: 'Total Reconciliations',
    Icon: GitCompareArrows,
    gradient: 'from-violet-300 via-violet-500 to-violet-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(139,92,246,0.55)]',
    skeletonColors: ['#C4B5FD', '#8B5CF6', '#6D28D9'] as [string, string, string],
    value: (s: HistoryStatsData) => formatNumber(s.totalReconciliations.value),
    deltaPercent: (s: HistoryStatsData) => s.totalReconciliations.deltaPercent,
    lowerIsBetter: false,
  },
  {
    label: 'Average Match Rate',
    Icon: Percent,
    gradient: 'from-emerald-300 via-emerald-500 to-emerald-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(16,185,129,0.55)]',
    skeletonColors: ['#6EE7B7', '#10B981', '#047857'] as [string, string, string],
    value: (s: HistoryStatsData) => formatPercent(s.avgMatchRate.value),
    deltaPercent: (s: HistoryStatsData) => s.avgMatchRate.deltaPercent,
    lowerIsBetter: false,
  },
  {
    label: 'Total Break Value',
    Icon: Banknote,
    gradient: 'from-rose-300 via-rose-500 to-rose-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(244,63,94,0.55)]',
    skeletonColors: ['#FDA4AF', '#F43F5E', '#BE123C'] as [string, string, string],
    value: (s: HistoryStatsData) => formatCurrency(s.totalBreakValue.value),
    deltaPercent: (s: HistoryStatsData) => s.totalBreakValue.deltaPercent,
    lowerIsBetter: true,
  },
  {
    label: 'Total Transactions',
    Icon: Receipt,
    gradient: 'from-sky-300 via-sky-500 to-sky-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(14,165,233,0.55)]',
    skeletonColors: ['#7DD3FC', '#0EA5E9', '#0369A1'] as [string, string, string],
    value: (s: HistoryStatsData) => formatNumber(s.totalTransactions.value),
    deltaPercent: (s: HistoryStatsData) => s.totalTransactions.deltaPercent,
    lowerIsBetter: false,
  },
] as const

function StatBadgeSkeleton({ label, colors }: { label: string; colors: readonly [string, string, string] }) {
  const gradientId = `history-stat-skeleton-${label.replace(/\s+/g, '-').toLowerCase()}`
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

export default function HistoryStats({ stats, isLoading }: HistoryStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARD_DEFS.map((card) => (
          <div key={card.label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 p-3">
            <StatBadgeSkeleton label={card.label} colors={card.skeletonColors} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_DEFS.map(({ label, Icon, gradient, glow, value, deltaPercent, lowerIsBetter }) => {
        const delta = deltaPercent(stats)
        const arrowUp = (delta ?? 0) >= 0
        const isGood = lowerIsBetter ? !arrowUp : arrowUp

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
              <TruncateTooltip as="p" className="truncate text-2xl font-bold text-white" tooltip={value(stats)}>
                {value(stats)}
              </TruncateTooltip>
              {delta == null ? (
                <p className="text-xs text-slate-400">No prior-period data yet</p>
              ) : (
                <p className="flex items-center gap-1 text-xs font-medium">
                  {arrowUp ? (
                    <ArrowUp className={`h-3 w-3 shrink-0 ${isGood ? 'text-emerald-400' : 'text-rose-400'}`} />
                  ) : (
                    <ArrowDown className={`h-3 w-3 shrink-0 ${isGood ? 'text-emerald-400' : 'text-rose-400'}`} />
                  )}
                  <TruncateTooltip as="span" className="min-w-0 truncate" tooltip={`${formatPercent(Math.abs(delta), 1)} vs last 30 days`}>
                    <span className={isGood ? 'text-emerald-400' : 'text-rose-400'}>{formatPercent(Math.abs(delta), 1)}</span>{' '}
                    <span className="text-slate-400">vs last 30 days</span>
                  </TruncateTooltip>
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
