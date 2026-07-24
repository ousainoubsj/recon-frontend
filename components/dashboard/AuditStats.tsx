import Image from 'next/image'
import { ArrowUp } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type Sub = { kind: 'trend'; value: string } | { kind: 'plain'; text: string; colorClassName: string }

const stats: {
  label: string
  value: string
  icon: string
  sub: Sub
}[] = [
  {
    label: 'Total Activities',
    value: '12,842',
    icon: '/icons/audit-1.png',
    sub: { kind: 'trend', value: '18.7%' },
  },
  {
    label: 'Successful Activities',
    value: '11,256',
    icon: '/icons/audit-2.png',
    sub: { kind: 'plain', text: '87.6% of total', colorClassName: 'text-slate-400' },
  },
  {
    label: 'Failed Activities',
    value: '286',
    icon: '/icons/audit-3.png',
    sub: { kind: 'plain', text: '2.2% of total', colorClassName: 'text-rose-400' },
  },
  {
    label: 'Unique Users',
    value: '42',
    icon: '/icons/audit-4.png',
    sub: { kind: 'trend', value: '7' },
  },
]

export default function AuditStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon, sub }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 p-3">
          <div className="relative h-15 w-15 shrink-0 overflow-visible">
            <Image src={icon} alt="" width={64} height={64} className="h-full w-full scale-155 object-contain" />
          </div>
          <div className="min-w-0">
            <TruncateTooltip as="p" className="truncate text-sm text-slate-300" tooltip={label}>
              {label}
            </TruncateTooltip>
            <TruncateTooltip as="p" className="truncate text-2xl font-bold text-white" tooltip={value}>
              {value}
            </TruncateTooltip>
            {sub.kind === 'trend' ? (
              <p className=" flex items-center gap-1 text-xs font-medium">
                <ArrowUp className="h-3 w-3 shrink-0 text-emerald-400" />
                <TruncateTooltip as="span" className="min-w-0 truncate" tooltip={`${sub.value} vs last 30 days`}>
                  <span className="text-emerald-400">{sub.value}</span> <span className="text-slate-400">vs last 30 days</span>
                </TruncateTooltip>
              </p>
            ) : (
              <TruncateTooltip as="p" className={`truncate text-xs font-medium ${sub.colorClassName}`} tooltip={sub.text}>
                {sub.text}
              </TruncateTooltip>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
