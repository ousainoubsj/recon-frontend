import { MoreHorizontal } from 'lucide-react'

type LogStatus = 'completed' | 'active' | 'pending'

const logEntries: {
  time: string
  text: string
  detail?: string
  status: LogStatus
}[] = [
  {
    time: '10:24:31 AM',
    text: 'Reading internal ledger file...',
    detail: '125,430 rows loaded',
    status: 'completed',
  },
  {
    time: '10:24:34 AM',
    text: 'Reading counterparty file...',
    detail: '124,980 rows loaded',
    status: 'completed',
  },
  {
    time: '10:24:38 AM',
    text: 'Validating data integrity and format...',
    status: 'completed',
  },
  {
    time: '10:24:45 AM',
    text: 'Standardizing dates, amounts, and references...',
    status: 'completed',
  },
  {
    time: '10:24:58 AM',
    text: 'Matching records based on mapping and rules...',
    status: 'active',
  },
  {
    time: '',
    text: 'Applying matching rules and tolerances...',
    status: 'pending',
  },
  {
    time: '',
    text: 'Generating summary and result sets...',
    status: 'pending',
  },
]

const statusStyles: Record<LogStatus, string> = {
  completed: 'bg-emerald-500/15 text-emerald-400',
  active: 'bg-indigo-500/25 text-indigo-300',
  pending: 'bg-white/5 text-slate-500',
}

const statusLabels: Record<LogStatus, string> = {
  completed: 'Completed',
  active: 'In Progress',
  pending: 'Pending',
}

const dotStyles: Record<LogStatus, string> = {
  completed: 'bg-emerald-400',
  active: 'h-2.5 w-2.5 bg-sky-400',
  pending: 'bg-slate-600',
}

export default function LiveProcessLog() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/20 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Live Process Log</h3>
        <button type="button" aria-label="More options" className="cursor-pointer text-slate-500 hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <ul className="mt-3">
        {logEntries.map((entry, i) => (
          <li key={i} className="flex gap-4">
            <span className="w-24 shrink-0 pt-3 text-xs text-slate-400">{entry.time}</span>

            <div className="relative flex w-2.5 shrink-0 flex-col items-center">
              {i < logEntries.length - 1 && (
                <span className="absolute top-3.5 h-full w-px bg-[#232D47]" />
              )}
              <span className={`relative z-10 mt-3.5 h-2 w-2 rounded-full ${dotStyles[entry.status]}`} />
            </div>

            <p className="min-w-0 flex-1 py-3 text-sm">
              <span className={entry.status === 'pending' ? 'text-slate-500' : 'text-slate-200'}>{entry.text}</span>
              {entry.detail && <span className="ml-1.5 text-slate-400">{entry.detail}</span>}
            </p>

            <span
              className={`h-fit shrink-0 self-center rounded-md px-2.5 py-1 text-xs font-medium ${statusStyles[entry.status]}`}
            >
              {statusLabels[entry.status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
