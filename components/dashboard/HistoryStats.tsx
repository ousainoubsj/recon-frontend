import Image from 'next/image'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

const stats = [
  {
    label: 'Total Reconciliations',
    value: '128',
    trend: '18.7%',
    trendUp: true,
    icon: '/icons/total-recon.png',
  },
  {
    label: 'Average Match Rate',
    value: '97.42%',
    trend: '1.63%',
    trendUp: true,
    icon: '/icons/avg-matched.png',
  },
  {
    label: 'Total Break Value',
    value: '$1,245,750.32',
    trend: '12.4%',
    trendUp: false,
    icon: '/icons/total-break.png',
  },
  {
    label: 'Total Transactions',
    value: '24.8M',
    trend: '23.5%',
    trendUp: true,
    icon: '/icons/total-transaction.png',
  },
]

export default function HistoryStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, trend, trendUp, icon }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A] p-3">
          <div className="relative h-16 w-16 shrink-0 overflow-visible">
            <Image src={icon} alt="" width={64} height={64} className="h-full w-full scale-170 object-contain" />
          </div>
          <div className="min-w-0">
            <TruncateTooltip as="p" className="truncate text-sm text-slate-300" tooltip={label}>
              {label}
            </TruncateTooltip>
            <TruncateTooltip as="p" className="mt-1 truncate text-2xl font-bold text-white" tooltip={value}>
              {value}
            </TruncateTooltip>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium">
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
