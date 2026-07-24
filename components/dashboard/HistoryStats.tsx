import { ArrowDown, ArrowUp, GitCompareArrows, Percent, Banknote, Receipt } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

const stats = [
  {
    label: 'Total Reconciliations',
    value: '128',
    trend: '18.7%',
    trendUp: true,
    Icon: GitCompareArrows,
    gradient: 'from-violet-300 via-violet-500 to-violet-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(139,92,246,0.55)]',
  },
  {
    label: 'Average Match Rate',
    value: '97.42%',
    trend: '1.63%',
    trendUp: true,
    Icon: Percent,
    gradient: 'from-emerald-300 via-emerald-500 to-emerald-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(16,185,129,0.55)]',
  },
  {
    label: 'Total Break Value',
    value: '$1,245,750.32',
    trend: '12.4%',
    trendUp: false,
    Icon: Banknote,
    gradient: 'from-rose-300 via-rose-500 to-rose-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(244,63,94,0.55)]',
  },
  {
    label: 'Total Transactions',
    value: '24.8M',
    trend: '23.5%',
    trendUp: true,
    Icon: Receipt,
    gradient: 'from-sky-300 via-sky-500 to-sky-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(14,165,233,0.55)]',
  },
]

export default function HistoryStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, trend, trendUp, Icon, gradient, glow }) => (
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
            <TruncateTooltip as="p" className=" truncate text-2xl font-bold text-white" tooltip={value}>
              {value}
            </TruncateTooltip>
            <p className=" flex items-center gap-1 text-xs font-medium">
              {trendUp ? (
                <ArrowUp className="h-3 w-3 shrink-0 text-emerald-400" />
              ) : (
                <ArrowDown className="h-3 w-3 shrink-0 text-rose-400" />
              )}
              <TruncateTooltip as="span" className="min-w-0 truncate" tooltip={`${trend} vs last 30 days`}>
                <span className={trendUp ? 'text-emerald-400' : 'text-rose-400'}>{trend}</span>{' '}
                <span className="text-slate-400">vs last 30 days</span>
              </TruncateTooltip>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
