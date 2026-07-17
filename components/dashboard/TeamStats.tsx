import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M2.5 20c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6" />
      <path d="M15.5 6.2a3 3 0 0 1 0 5.6" />
      <path d="M14.5 14.2c2.6.5 4.5 2.8 4.5 5.8" />
    </svg>
  )
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
      <path d="M9 12.2l2 2 4-4.3" />
    </svg>
  )
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8l4 3 4-6 4 6 4-3-2 10H6L4 8Z" />
      <path d="M6 18h12" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      <circle cx="12" cy="15.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  )
}

type Sub =
  | { kind: 'trend'; direction: 'up' | 'down'; value: string; suffix: string }
  | { kind: 'plain'; text: string; colorClassName: string }
  | { kind: 'link'; text: string }

const stats: {
  label: string
  value: string
  Icon: typeof UsersIcon
  iconBg: string
  iconColor: string
  sub: Sub
}[] = [
  {
    label: 'Total Users',
    value: '42',
    Icon: UsersIcon,
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    sub: { kind: 'trend', direction: 'up', value: '8', suffix: 'new this month' },
  },
  {
    label: 'Active Users',
    value: '38',
    Icon: ShieldCheckIcon,
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    sub: { kind: 'plain', text: '90.5% of total', colorClassName: 'text-slate-400' },
  },
  {
    label: 'Administrators',
    value: '6',
    Icon: CrownIcon,
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    sub: { kind: 'plain', text: '14.3% of total', colorClassName: 'text-slate-400' },
  },
  {
    label: 'Inactive Users',
    value: '4',
    Icon: LockIcon,
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    sub: { kind: 'trend', direction: 'down', value: '2', suffix: 'deactivated' },
  },
  {
    label: 'Pending Invites',
    value: '3',
    Icon: MailIcon,
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-400',
    sub: { kind: 'link', text: 'View invites' },
  },
]

export default function TeamStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map(({ label, value, Icon, iconBg, iconColor, sub }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 p-3">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
            <Icon />
          </span>
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
              <TruncateTooltip as="p" className={`mt-1 truncate text-xs font-medium ${sub.colorClassName}`} tooltip={sub.text}>
                {sub.text}
              </TruncateTooltip>
            )}
            {sub.kind === 'link' && (
              <a href="#" className="mt-1 flex items-center gap-1 text-xs font-medium text-indigo-400 hover:underline">
                {sub.text}
                <ArrowRight className="h-3 w-3 shrink-0" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
