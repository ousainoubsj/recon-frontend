import { ArrowDown, ArrowUp, GitCompareArrows, Percent, Unlink2, Banknote } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber, formatPercent } from '@/lib/format'
import { useOrgFormat } from '@/lib/hooks/useOrgFormat'
import type { ReportsSummary } from '@/types/reports'

type Fmt = (v: number | string | null | undefined) => string

type StatsOverviewProps = {
  summary?: ReportsSummary
  isLoading?: boolean
}

// "Lower is better" for Unmatched/Break Value — the arrow still reflects the
// real direction of change, but the color reflects whether that change is
// good or bad for that specific metric.
const CARD_DEFS = [
  {
    label: 'Total Reconciliations',
    Icon: GitCompareArrows,
    gradient: 'from-violet-300 via-violet-500 to-violet-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(139,92,246,0.55)]',
    skeletonColors: ['#C4B5FD', '#8B5CF6', '#6D28D9'] as [string, string, string],
    value: (s: ReportsSummary, _formatCurrency: Fmt) => formatNumber(s.totalReconciliations.current),
    deltaPercent: (s: ReportsSummary) => s.totalReconciliations.deltaPercent,
    lowerIsBetter: false,
  },
  {
    label: 'Match Rate (Avg.)',
    Icon: Percent,
    gradient: 'from-emerald-300 via-emerald-500 to-emerald-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(16,185,129,0.55)]',
    skeletonColors: ['#6EE7B7', '#10B981', '#047857'] as [string, string, string],
    value: (s: ReportsSummary, _formatCurrency: Fmt) => formatPercent(s.avgMatchRate.current),
    deltaPercent: (s: ReportsSummary) => s.avgMatchRate.deltaPercent,
    lowerIsBetter: false,
  },
  {
    label: 'Unmatched Transactions',
    Icon: Unlink2,
    gradient: 'from-amber-300 via-amber-500 to-amber-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(245,158,11,0.55)]',
    skeletonColors: ['#FCD34D', '#F59E0B', '#B45309'] as [string, string, string],
    value: (s: ReportsSummary, _formatCurrency: Fmt) => formatNumber(s.unmatchedTransactions.current),
    deltaPercent: (s: ReportsSummary) => s.unmatchedTransactions.deltaPercent,
    lowerIsBetter: true,
  },
  {
    label: 'Total Break Value',
    Icon: Banknote,
    gradient: 'from-rose-300 via-rose-500 to-rose-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(244,63,94,0.55)]',
    skeletonColors: ['#FDA4AF', '#F43F5E', '#BE123C'] as [string, string, string],
    value: (s: ReportsSummary, formatCurrency: Fmt) => formatCurrency(s.totalBreakValue.current),
    deltaPercent: (s: ReportsSummary) => s.totalBreakValue.deltaPercent,
    lowerIsBetter: true,
  },
] as const

// Mirrors the loaded badge's exact structure (gradient circle + top glare +
// bottom shading) instead of a flat gray Skeleton circle, so the loading
// state already hints at which stat is which via its real color.
function StatBadgeSkeleton({ label, colors }: { label: string; colors: readonly [string, string, string] }) {
  const gradientId = `stat-skeleton-${label.replace(/\s+/g, '-').toLowerCase()}`
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

export default function StatsOverview({ summary, isLoading }: StatsOverviewProps) {
  const { formatCurrency } = useOrgFormat()

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARD_DEFS.map((card) => (
          <div key={card.label} className="flex items-center gap-2.5 rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-4">
            <StatBadgeSkeleton label={card.label} colors={card.skeletonColors} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARD_DEFS.map(({ label, Icon, gradient, glow, value, deltaPercent, lowerIsBetter }) => {
        const delta = deltaPercent(summary)
        const arrowUp = (delta ?? 0) >= 0
        const isGood = lowerIsBetter ? !arrowUp : arrowUp

        return (
          <div key={label} className="flex items-center gap-2.5 rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-4">
            <span
              className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/15 ${glow}`}
            >
              <span className={`pointer-events-none absolute inset-0 rounded-full bg-linear-to-br ${gradient} opacity-30`} />
              <span className="pointer-events-none absolute -top-3 left-1/2 h-8 w-10 -translate-x-1/2 rounded-full bg-white/30 blur-md" />
              <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-t from-black/20 via-transparent to-transparent" />
              <Icon className="relative h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm text-slate-400">{label}</p>
              <div className=" flex items-baseline gap-1">
                <p className="text-2xl font-bold text-white">{value(summary, formatCurrency)}</p>
                <span
                  className={`group relative flex items-center cursor-pointer gap-1 text-xs font-medium ${
                    delta == null ? 'text-slate-500' : isGood ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {delta != null ? (
                    <>
                      {arrowUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {formatPercent(Math.abs(delta), 1)}
                    </>
                  ) : (
                    <span>No comparison yet</span>
                  )}
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#232D47] bg-[#111A33] px-2 py-1 text-xs font-normal text-slate-300 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                    {delta != null ? 'vs last month' : 'No prior period to compare against yet'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
