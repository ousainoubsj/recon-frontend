import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type Sub =
  | { kind: 'trend'; direction: 'up' | 'down'; value: string; suffix: string }
  | { kind: 'plain'; text: string; colorClassName: string }
  | { kind: 'link'; text: string }

const stats: {
  label: string
  value: string
  icon: string
  sub: Sub
}[] = [
  {
    label: 'Total Users',
    value: '42',
    icon: '/icons/total-users-2.png',
    sub: { kind: 'trend', direction: 'up', value: '8', suffix: 'new this month' },
  },
  {
    label: 'Active Users',
    value: '38',
    icon: '/icons/active-users-2.png',
    sub: { kind: 'plain', text: '90.5% of total', colorClassName: 'text-slate-400' },
  },
  {
    label: 'Administrators',
    value: '6',
    icon: '/icons/admin.png',
    sub: { kind: 'plain', text: '14.3% of total', colorClassName: 'text-slate-400' },
  },
  {
    label: 'Inactive Users',
    value: '4',
    icon: '/icons/inactive-users-2.png',
    sub: { kind: 'trend', direction: 'down', value: '2', suffix: 'deactivated' },
  },
  {
    label: 'Pending Invites',
    value: '3',
    icon: '/icons/pending-invites.png',
    sub: { kind: 'link', text: 'View invites' },
  },
]

export default function TeamStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map(({ label, value, icon, sub }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 p-3">
          <div className="relative h-14 w-14 shrink-0 overflow-visible">
            <Image src={icon} alt="" width={64} height={64} className="h-full w-full scale-140 object-contain" />
          </div>
          <div className="min-w-0">
            <TruncateTooltip as="p" className="truncate text-sm text-slate-300" tooltip={label}>
              {label}
            </TruncateTooltip>
            <TruncateTooltip as="p" className="truncate text-2xl font-bold text-white" tooltip={value}>
              {value}
            </TruncateTooltip>
            {sub.kind === 'trend' && (
              <p className="flex items-center gap-1 text-xs font-medium">
                {sub.direction === 'up' ? (
                  <ArrowUp className="h-3 w-3 shrink-0 text-emerald-400" />
                ) : (
                  <ArrowDown className="h-3 w-3 shrink-0 text-rose-400" />
                )}
                <TruncateTooltip as="span" className="min-w-0 truncate" tooltip={`${sub.value} ${sub.suffix}`}>
                  <span className={sub.direction === 'up' ? 'text-emerald-400' : 'text-rose-400'}>{sub.value}</span>{' '}
                  <span className="text-slate-400">{sub.suffix}</span>
                </TruncateTooltip>
              </p>
            )}
            {sub.kind === 'plain' && (
              <TruncateTooltip as="p" className={`truncate text-xs font-medium ${sub.colorClassName}`} tooltip={sub.text}>
                {sub.text}
              </TruncateTooltip>
            )}
            {sub.kind === 'link' && (
              <Link href="#" className="flex items-center gap-1 text-xs truncate font-medium text-indigo-400 hover:underline">
                {sub.text}
                <ArrowRight className="h-3 w-3 shrink-0" />
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
