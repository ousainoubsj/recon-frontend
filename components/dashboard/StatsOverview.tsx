import Image from 'next/image'
import { ArrowDown, ArrowUp } from 'lucide-react'

const stats = [
  {
    label: 'Total Reconciliations',
    value: '128',
    trend: '18.6%',
    trendUp: true,
    icon: '/total-recon.png',
  },
  {
    label: 'Match Rate (Avg.)',
    value: '98.64%',
    trend: '2.37%',
    trendUp: true,
    icon: '/match-rate.png',
  },
  {
    label: 'Unmatched Transactions',
    value: '2,451',
    trend: '12.4%',
    trendUp: false,
    icon: '/unmatched-transac.png',
  },
  {
    label: 'Total Break Value',
    value: '$245,430.75',
    trend: '8.7%',
    trendUp: false,
    icon: '/break-value.png',
  },
]

export default function StatsOverview() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, trend, trendUp, icon }) => (
        <div key={label} className="flex items-center gap-2.5 rounded-2xl border border-[#232D47] bg-[#0D152A]/50 p-4">
          <span className="relative h-16 w-16 shrink-0 overflow-visible">
            <Image src={icon} alt="" width={64} height={64} className="h-full w-full scale-150 object-contain" />
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
