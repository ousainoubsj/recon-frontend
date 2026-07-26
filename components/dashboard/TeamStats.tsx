import { Users, ShieldCheck, Crown, Lock, Mail, ArrowUp, ArrowDown } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber, formatPercent } from '@/lib/format'
import type { TeamStats as TeamStatsData } from '@/types/team'

type TeamStatsProps = {
  stats?: TeamStatsData
  isLoading?: boolean
  onViewInvites?: () => void
}

function pctOfTotal(count: number, total: number) {
  return total > 0 ? formatPercent((count / total) * 100, 1) : '—'
}

const CARD_DEFS = [
  {
    label: 'Total Users',
    Icon: Users,
    gradient: 'from-violet-300 via-violet-500 to-violet-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(139,92,246,0.55)]',
    skeletonColors: ['#C4B5FD', '#8B5CF6', '#6D28D9'] as [string, string, string],
    value: (s: TeamStatsData) => s.totalUsers,
    trend: (s: TeamStatsData) => (
      <span className="flex items-center gap-1 text-xs text-slate-400">
        <ArrowUp className="h-3 w-3 text-emerald-400" />
        <span className="text-emerald-400">{s.newThisMonth}</span> new this month
      </span>
    ),
  },
  {
    label: 'Active Users',
    Icon: ShieldCheck,
    gradient: 'from-emerald-300 via-emerald-500 to-emerald-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(16,185,129,0.55)]',
    skeletonColors: ['#6EE7B7', '#10B981', '#047857'] as [string, string, string],
    value: (s: TeamStatsData) => s.activeUsers,
    trend: (s: TeamStatsData) => <span className="text-xs text-slate-400">{pctOfTotal(s.activeUsers, s.totalUsers)} of total</span>,
  },
  {
    label: 'Administrators',
    Icon: Crown,
    gradient: 'from-fuchsia-300 via-fuchsia-500 to-fuchsia-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(217,70,239,0.55)]',
    skeletonColors: ['#F0ABFC', '#D946EF', '#A21CAF'] as [string, string, string],
    value: (s: TeamStatsData) => s.administrators,
    trend: (s: TeamStatsData) => (
      <span className="text-xs text-slate-400">{pctOfTotal(s.administrators, s.totalUsers)} of total</span>
    ),
  },
  {
    label: 'Inactive Users',
    Icon: Lock,
    gradient: 'from-amber-300 via-amber-500 to-amber-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(245,158,11,0.55)]',
    skeletonColors: ['#FCD34D', '#F59E0B', '#B45309'] as [string, string, string],
    value: (s: TeamStatsData) => s.inactiveUsers,
    trend: (s: TeamStatsData) => (
      <span className="flex items-center gap-1 text-xs text-slate-400">
        <ArrowDown className="h-3 w-3 text-rose-400" />
        <span className="text-rose-400">{s.deactivatedThisMonth}</span> deactivated
      </span>
    ),
  },
] as const

function StatBadgeSkeleton({ label, colors }: { label: string; colors: readonly [string, string, string] }) {
  const gradientId = `team-stat-skeleton-${label.replace(/\s+/g, '-').toLowerCase()}`
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

export default function TeamStats({ stats, isLoading, onViewInvites }: TeamStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {CARD_DEFS.map((card) => (
          <div key={card.label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 px-3 py-2">
            <StatBadgeSkeleton label={card.label} colors={card.skeletonColors} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-10" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 px-3 py-2">
          <StatBadgeSkeleton label="Pending Invites" colors={['#7DD3FC', '#0EA5E9', '#0369A1']} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-10" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {CARD_DEFS.map(({ label, Icon, gradient, glow, value, trend }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 px-3 py-2">
          <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/15 ${glow}`}>
            <span className={`pointer-events-none absolute inset-0 rounded-full bg-linear-to-br ${gradient} opacity-30`} />
            <span className="pointer-events-none absolute -top-3 left-1/2 h-8 w-10 -translate-x-1/2 rounded-full bg-white/30 blur-md" />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-t from-black/20 via-transparent to-transparent" />
            <Icon className="relative h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-300">{label}</p>
            <p className="text-2xl font-bold text-white">{formatNumber(value(stats))}</p>
            {trend(stats)}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 px-3 py-2">
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/15 shadow-[0_6px_16px_-4px_rgba(14,165,233,0.55)]">
          <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-br from-sky-300 via-sky-500 to-sky-700 opacity-30" />
          <span className="pointer-events-none absolute -top-3 left-1/2 h-8 w-10 -translate-x-1/2 rounded-full bg-white/30 blur-md" />
          <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-t from-black/20 via-transparent to-transparent" />
          <Mail className="relative h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-300">Pending Invites</p>
          <p className="text-2xl font-bold text-white">{formatNumber(stats.pendingInvites)}</p>
          {onViewInvites && (
            <button
              type="button"
              onClick={onViewInvites}
              className="flex cursor-pointer items-center gap-1 text-xs font-medium text-indigo-400 hover:underline"
            >
              View invites
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
