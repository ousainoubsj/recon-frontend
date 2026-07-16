import { ArrowUp } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

function TotalActivitiesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4h4" />
      <path d="M8.5 11h5" />
      <path d="M8.5 14h3" />
      <path d="M16.3 15.2l2 2-2.9 1 .9-3Z" />
    </svg>
  )
}

function SuccessShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
      <path d="M9 12.2l2 2 4-4.3" />
    </svg>
  )
}

function WarningTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4 3 20h18L12 4Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function InfoCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="7.7" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

type Sub = { kind: 'trend'; value: string } | { kind: 'plain'; text: string; colorClassName: string }

const stats: {
  label: string
  value: string
  Icon: typeof TotalActivitiesIcon
  iconBg: string
  iconColor: string
  sub: Sub
}[] = [
  {
    label: 'Total Activities',
    value: '12,842',
    Icon: TotalActivitiesIcon,
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    sub: { kind: 'trend', value: '18.7%' },
  },
  {
    label: 'Successful Activities',
    value: '11,256',
    Icon: SuccessShieldIcon,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    sub: { kind: 'plain', text: '87.6% of total', colorClassName: 'text-slate-400' },
  },
  {
    label: 'Failed Activities',
    value: '286',
    Icon: WarningTriangleIcon,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    sub: { kind: 'plain', text: '2.2% of total', colorClassName: 'text-rose-400' },
  },
  {
    label: 'Unique Users',
    value: '42',
    Icon: InfoCircleIcon,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    sub: { kind: 'trend', value: '7' },
  },
]

export default function AuditStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, Icon, iconBg, iconColor, sub }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A] p-3">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
            <Icon />
          </span>
          <div className="min-w-0">
            <TruncateTooltip as="p" className="truncate text-sm text-slate-300" tooltip={label}>
              {label}
            </TruncateTooltip>
            <TruncateTooltip as="p" className="mt-1 truncate text-2xl font-bold text-white" tooltip={value}>
              {value}
            </TruncateTooltip>
            {sub.kind === 'trend' ? (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium">
                <ArrowUp className="h-3 w-3 shrink-0 text-emerald-400" />
                <TruncateTooltip as="span" className="min-w-0 truncate" tooltip={`${sub.value} vs last 30 days`}>
                  <span className="text-emerald-400">{sub.value}</span> <span className="text-slate-400">vs last 30 days</span>
                </TruncateTooltip>
              </p>
            ) : (
              <TruncateTooltip as="p" className={`mt-1 truncate text-xs font-medium ${sub.colorClassName}`} tooltip={sub.text}>
                {sub.text}
              </TruncateTooltip>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
