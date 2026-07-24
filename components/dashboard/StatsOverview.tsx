import { ArrowDown, ArrowUp, GitCompareArrows, Percent, Unlink2, Banknote } from 'lucide-react'

const stats = [
  {
    label: 'Total Reconciliations',
    value: '128',
    trend: '18.6%',
    trendUp: true,
    Icon: GitCompareArrows,
    gradient: 'from-violet-300 via-violet-500 to-violet-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(139,92,246,0.55)]',
  },
  {
    label: 'Match Rate (Avg.)',
    value: '98.64%',
    trend: '2.37%',
    trendUp: true,
    Icon: Percent,
    gradient: 'from-emerald-300 via-emerald-500 to-emerald-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(16,185,129,0.55)]',
  },
  {
    label: 'Unmatched Transactions',
    value: '2,451',
    trend: '12.4%',
    trendUp: false,
    Icon: Unlink2,
    gradient: 'from-amber-300 via-amber-500 to-amber-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(245,158,11,0.55)]',
  },
  {
    label: 'Total Break Value',
    value: '$245,430.75',
    trend: '8.7%',
    trendUp: false,
    Icon: Banknote,
    gradient: 'from-rose-300 via-rose-500 to-rose-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(244,63,94,0.55)]',
  },
]

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, trend, trendUp, Icon, gradient, glow }) => (
        <div key={label} className="flex items-center gap-2.5 rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-4">
          <span
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/15 ${glow}`}
          >
            <span className={`pointer-events-none absolute inset-0 rounded-full bg-linear-to-br ${gradient} opacity-80`} />
            <span className="pointer-events-none absolute -top-3 left-1/2 h-8 w-10 -translate-x-1/2 rounded-full bg-white/30 blur-md" />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-t from-black/20 via-transparent to-transparent" />
            <Icon className="relative h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" strokeWidth={2} />
          </span>
          <div>
            <p className="text-sm text-slate-400">{label}</p>
            <div className=" flex items-baseline gap-1">
              <p className="text-2xl font-bold text-white">{value}</p>
              <span
                className={`group relative flex items-center cursor-pointer gap-1 text-xs font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {trend}
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#232D47] bg-[#111A33] px-2 py-1 text-xs font-normal text-slate-300 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                  vs last month
                </span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
