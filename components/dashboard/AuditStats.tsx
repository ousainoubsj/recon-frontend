import { ArrowUp, Activity, ShieldCheck, AlertTriangle, Users } from 'lucide-react'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type Sub = { kind: 'trend'; value: string } | { kind: 'plain'; text: string; colorClassName: string }

const stats: {
  label: string
  value: string
  Icon: typeof Activity
  gradient: string
  glow: string
  sub: Sub
}[] = [
  {
    label: 'Total Activities',
    value: '12,842',
    Icon: Activity,
    gradient: 'from-violet-300 via-violet-500 to-violet-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(139,92,246,0.55)]',
    sub: { kind: 'trend', value: '18.7%' },
  },
  {
    label: 'Successful Activities',
    value: '11,256',
    Icon: ShieldCheck,
    gradient: 'from-emerald-300 via-emerald-500 to-emerald-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(16,185,129,0.55)]',
    sub: { kind: 'plain', text: '87.6% of total', colorClassName: 'text-slate-400' },
  },
  {
    label: 'Failed Activities',
    value: '286',
    Icon: AlertTriangle,
    gradient: 'from-amber-300 via-amber-500 to-amber-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(245,158,11,0.55)]',
    sub: { kind: 'plain', text: '2.2% of total', colorClassName: 'text-rose-400' },
  },
  {
    label: 'Unique Users',
    value: '42',
    Icon: Users,
    gradient: 'from-sky-300 via-sky-500 to-sky-700',
    glow: 'shadow-[0_6px_16px_-4px_rgba(14,165,233,0.55)]',
    sub: { kind: 'trend', value: '7' },
  },
]

export default function AuditStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, Icon, gradient, glow, sub }) => (
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
