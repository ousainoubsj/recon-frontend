type IconKind = 'trend' | 'check' | 'warning' | 'dollar' | 'copy'

type Stat = {
  label: string
  value: string
  sub?: string
  change?: { direction: 'up' | 'down'; label: string }
  accent: string
  icon: IconKind
  progress?: number
  highlighted?: boolean
}

const stats: Stat[] = [
  {
    label: 'Match Rate',
    value: '98.64%',
    change: { direction: 'up', label: '2.37% vs last run' },
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
    change: { direction: 'down', label: '8.71% vs last run' },
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
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.3l2.5 2.5L16 9" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5v10.5" />
      <path d="M8.2 10.7L12 14.5l3.8-3.8" />
      <path d="M5 16.5v2A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5v-2" />
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

function TrendArrow({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg viewBox="0 0 10 10" className={`h-2.5 w-2.5 ${direction === 'down' ? 'rotate-180' : ''}`} fill="currentColor">
      <path d="M5 0L10 8H0Z" />
    </svg>
  )
}

function StatIcon({ accent, kind }: { accent: string; kind: IconKind }) {
  const r = 18
  const circumference = 2 * Math.PI * r

  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${circumference * 0.8} ${circumference}`}
          opacity="0.85"
        />
      </svg>
      {kind === 'trend' && <span className="absolute top-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" />}

      <svg
        viewBox="0 0 24 24"
        className="relative h-5 w-5"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === 'trend' && (
          <>
            <path d="M4 15.5l4.5-5 3.5 3 5.5-6.5" />
            <path d="M13.5 6.3H18V10.8" />
          </>
        )}
        {kind === 'check' && <path d="M6 12.3l3.5 3.5L18 7" />}
        {kind === 'warning' && (
          <>
            <path d="M12 3.8l9.2 16H2.8z" strokeLinejoin="round" />
            <path d="M12 10v4" />
            <circle cx="12" cy="17" r="0.7" fill={accent} stroke="none" />
          </>
        )}
        {kind === 'dollar' && (
          <text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="700" fill={accent} stroke="none">
            $
          </text>
        )}
        {kind === 'copy' && (
          <>
            <rect x="3.5" y="3.5" width="11" height="11" rx="2" />
            <rect x="9.5" y="9.5" width="11" height="11" rx="2" />
          </>
        )}
      </svg>
    </div>
  )
}

export default function ReconciliationResults() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <CheckBadge />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white">Reconciliation Results</h1>
            <p className="mt-1 text-sm text-[#A3B2C8]">Your reconciliation is complete. Here&apos;s how your data matched.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#232D47] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5"
          >
            <DownloadIcon />
            Download Report
          </button>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            <ShareIcon />
            Share Results
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0E182D] px-4 py-2.5 text-sm">
          <span className="text-slate-500">Reconciliation Name:</span>
          <span className="font-medium text-slate-200">June Bank Reconciliation</span>
          <button type="button" className="cursor-pointer text-slate-500 hover:text-white">
            <PencilIcon />
          </button>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0E182D] px-4 py-2.5 text-sm">
          <span className="text-slate-500">Date:</span>
          <span className="font-medium text-slate-200">Jun 30, 2026 10:27 AM</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-[#232D47] bg-[#0E182D] px-4 py-2.5 text-sm">
          <span className="text-slate-500">File Pair:</span>
          <span className="font-medium text-slate-200">Internal_Ledger_June.csv</span>
          <span className="rounded border border-[#232D47] px-1 py-0.5 text-[10px] font-semibold text-slate-500">VS</span>
          <span className="font-medium text-slate-200">Bank_Statement_June.csv</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border p-5"
            style={{ borderColor: stat.highlighted ? `${stat.accent}66` : '#232D47' }}
          >
            <p className="text-sm text-slate-400">{stat.label}</p>

            <div className="mt-2 flex items-start justify-between gap-2">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <StatIcon accent={stat.accent} kind={stat.icon} />
            </div>

            {typeof stat.progress === 'number' && (
              <div className="mt-3 h-1.5 w-full rounded-full bg-[#1B2540]">
                <div
                  className="h-1.5 rounded-full bg-linear-to-r from-emerald-400 to-sky-400"
                  style={{ width: `${stat.progress}%` }}
                />
              </div>
            )}

            {stat.sub && <p className="mt-3 text-xs text-slate-500">{stat.sub}</p>}

            {stat.change && (
              <p
                className={`mt-3 flex items-center gap-1 text-xs font-medium ${
                  stat.change.direction === 'up' ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                <TrendArrow direction={stat.change.direction} />
                {stat.change.label}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
