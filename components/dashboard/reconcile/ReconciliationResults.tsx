import Image from 'next/image'
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react'
import ResultsOverviewPanel from '@/components/dashboard/reconcile/ResultsOverviewPanel'
import ResultsSidePanel from '@/components/dashboard/reconcile/ResultsSidePanel'
import { Button } from '@/components/ui/button'

type IconKind = 'trend' | 'check' | 'warning' | 'dollar' | 'copy'

const iconSrc: Record<IconKind, string> = {
  trend: '/icons/match-rate.png',
  check: '/icons/matched.png',
  warning: '/icons/unmatched.png',
  dollar: '/icons/break-value.png',
  copy: '/icons/duplicates.png',
}

type Stat = {
  label: string
  value: string
  sub?: string
  change?: { direction: 'up' | 'down'; value: string }
  accent: string
  icon: IconKind
  progress?: number
  highlighted?: boolean
}

const stats: Stat[] = [
  {
    label: 'Match Rate',
    value: '98.64%',
    change: { direction: 'up', value: '2.37%' },
    accent: '#2dd4bf',
    icon: 'trend',
    progress: 98.64,
    highlighted: true,
  },
  {
    label: 'Matched Transactions',
    value: '98,243',
    sub: '$24,850,431.12',
    accent: '#34d399',
    icon: 'check',
  },
  {
    label: 'Unmatched Transactions',
    value: '1,412',
    sub: '$312,450.75',
    accent: '#fb923c',
    icon: 'warning',
  },
  {
    label: 'Break Value',
    value: '$312,450.75',
    change: { direction: 'down', value: '8.71%' },
    accent: '#f87171',
    icon: 'dollar',
  },
  {
    label: 'Duplicates Found',
    value: '17',
    sub: '$2,145.30',
    accent: '#a78bfa',
    icon: 'copy',
  },
]

function CheckBadge() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.5 2.5L16 9" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="12" r="2" />
      <circle cx="17" cy="5.5" r="2" />
      <circle cx="17" cy="18.5" r="2" />
      <path d="M7.8 11l7.4-4.2" />
      <path d="M7.8 13l7.4 4.2" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4.5l3 3L8 17l-4 1 1-4L14.5 4.5z" />
    </svg>
  )
}

function StatIcon({ kind, highlighted }: { kind: IconKind; highlighted?: boolean }) {
  const size = highlighted ? 96 : 64

  return (
    <div className={`relative shrink-0 ${highlighted ? 'h-24 w-24' : 'h-16 w-16'}`}>
      <Image
        src={iconSrc[kind]}
        alt=""
        width={size}
        height={size}
        className={`h-full w-full object-contain ${highlighted ? 'scale-[1.35]' : 'scale-[1.6]'}`}
      />
    </div>
  )
}

type ReconciliationResultsProps = {
  onGoToExplorer?: () => void
}

export default function ReconciliationResults({ onGoToExplorer }: ReconciliationResultsProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-15 w-15 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckBadge />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">Reconciliation Results</h1>
            <p className="mt-1 text-sm text-[#A3B2C8]">Your reconciliation is complete. Here&apos;s how your data matched.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={onGoToExplorer}
            className="cursor-pointer rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95"
          >
            Go to Transaction Explorer
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0E182D]/30 px-4 py-2 text-sm">
          <span className="text-slate-400">Reconciliation Name:</span>
          <span className="font-medium text-slate-200">June Bank Reconciliation</span>
          <button type="button" className="cursor-pointer text-slate-500 hover:text-white">
            <PencilIcon />
          </button>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0E182D]/30 px-4 py-2 text-sm">
          <span className="text-slate-400">Date:</span>
          <span className="font-medium text-slate-200">Jun 30, 2026 10:27 AM</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0E182D]/30 px-4 py-2 text-sm">
          <span className="text-slate-400">File Pair:</span>
          <span className="font-medium text-slate-200">Internal_Ledger_June.csv</span>
          <span className="rounded border border-[#232D47] px-1 py-0.5 text-[10px] font-semibold text-slate-400">VS</span>
          <span className="font-medium text-slate-200">Bank_Statement_June.csv</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-3"
            style={
              stat.highlighted
                ? {
                    background: `radial-gradient(140% 120% at 0% 0%, ${stat.accent}26, transparent 65%), #0E182D`,
                    borderColor: `${stat.accent}50`,
                  }
                : { borderColor: '#232D47' }
            }
          >
            {stat.highlighted ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-300 truncate">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>

                  {typeof stat.progress === 'number' && (
                    <div className="mt-1 h-1.5 w-full rounded-full bg-[#1B2540]">
                      <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${stat.progress}%` }} />
                    </div>
                  )}

                  {stat.change && (
                    <p className="mt-3 flex items-center gap-1 text-xs font-medium">
                      <span
                        className={`flex items-center gap-0.5 ${
                          stat.change.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {stat.change.direction === 'up' ? (
                          <ArrowUp className="h-3 w-3" strokeWidth={3} />
                        ) : (
                          <ArrowDown className="h-3 w-3" strokeWidth={3} />
                        )}
                        {stat.change.value}
                      </span>
                      <span className="truncate text-slate-400">vs last run</span>
                    </p>
                  )}
                </div>

                <StatIcon kind={stat.icon} highlighted={stat.highlighted} />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-300 truncate">{stat.label}</p>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>

                    <div className="my-2 border-t border-[#1B2540]" />

                    {stat.sub && <p className="text-xs text-slate-400">{stat.sub}</p>}

                    {stat.change && (
                      <p className="flex items-center gap-1 text-xs font-medium">
                        <span
                          className={`flex items-center gap-0.5 ${
                            stat.change.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {stat.change.direction === 'up' ? (
                            <ArrowUp className="h-3 w-3" strokeWidth={3} />
                          ) : (
                            <ArrowDown className="h-3 w-3" strokeWidth={3} />
                          )}
                          {stat.change.value}
                        </span>
                        <span className="truncate text-slate-400">vs last run</span>
                      </p>
                    )}
                  </div>

                  <StatIcon kind={stat.icon} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <ResultsOverviewPanel />
        <ResultsSidePanel />
      </div>
    </div>
  )
}
