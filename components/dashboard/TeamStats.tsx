import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUp, Users, ShieldCheck, Crown, Lock, Mail } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type Sub =
  | { kind: 'trend'; direction: 'up' | 'down'; value: string; suffix: string }
  | { kind: 'plain'; text: string; colorClassName: string }
  | { kind: 'link'; text: string }

const stats: {
  label: string
  value: string
  Icon: typeof Users
  gradient: string
  glow: string
  sub: Sub
}[] = [
  {
    label: 'Total Users',
    value: '42',
    Icon: Users,
    gradient: 'from-violet-300 via-violet-500 to-violet-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(139,92,246,0.55)]',
    sub: { kind: 'trend', direction: 'up', value: '8', suffix: 'new this month' },
  },
  {
    label: 'Active Users',
    value: '38',
    Icon: ShieldCheck,
    gradient: 'from-emerald-300 via-emerald-500 to-emerald-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(16,185,129,0.55)]',
    sub: { kind: 'plain', text: '90.5% of total', colorClassName: 'text-slate-400' },
  },
  {
    label: 'Administrators',
    value: '6',
    Icon: Crown,
    gradient: 'from-fuchsia-300 via-fuchsia-500 to-fuchsia-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(217,70,239,0.55)]',
    sub: { kind: 'plain', text: '14.3% of total', colorClassName: 'text-slate-400' },
  },
  {
    label: 'Inactive Users',
    value: '4',
    Icon: Lock,
    gradient: 'from-amber-300 via-amber-500 to-amber-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(245,158,11,0.55)]',
    sub: { kind: 'trend', direction: 'down', value: '2', suffix: 'deactivated' },
  },
  {
    label: 'Pending Invites',
    value: '3',
    Icon: Mail,
    gradient: 'from-sky-300 via-sky-500 to-sky-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(14,165,233,0.55)]',
    sub: { kind: 'link', text: 'View invites' },
  },
]

export default function TeamStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map(({ label, value, Icon, gradient, glow, sub }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-[#232D47] bg-[#0D152A]/50 p-3">
          <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/15 ${glow}`}>
            <span className={`pointer-events-none absolute inset-0 rounded-full bg-linear-to-br ${gradient} opacity-80`} />
            <span className="pointer-events-none absolute -top-3 left-1/2 h-8 w-10 -translate-x-1/2 rounded-full bg-white/30 blur-md" />
            <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-t from-black/20 via-transparent to-transparent" />
            <Icon className="relative h-6 w-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" strokeWidth={2} />
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
