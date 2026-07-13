import { CheckCircle2, Info } from 'lucide-react'

const processingTasks = [
  { label: 'Reading Files', percent: 100, status: 'done' as const },
  { label: 'Validating Data', percent: 100, status: 'done' as const },
  { label: 'Standardizing Data', percent: 100, status: 'done' as const },
  { label: 'Matching Records', percent: 58, status: 'active' as const },
  { label: 'Applying Rules', percent: 0, status: 'pending' as const },
  { label: 'Generating Results', percent: 0, status: 'pending' as const },
]

const recordStats = [
  { label: 'Internal Records', value: '125,430', color: 'text-white' },
  { label: 'Counter... Records', value: '124,980', color: 'text-white' },
  { label: 'Records Compared', value: '146,872', color: 'text-sky-400' },
  { label: 'Est. Time Remaining', value: '--:--', color: 'text-sky-400/70' },
]

const activityItems = [
  { label: 'Comparing reference numbers', status: 'done' as const },
  { label: 'Matching amounts within tolerance (±0.01)', status: 'done' as const },
  { label: 'Evaluating date differences (±1 day)', status: 'done' as const },
  { label: 'Checking currency consistency', status: 'done' as const },
  { label: 'Detecting potential duplicates', status: 'done' as const },
  { label: 'Applying business rules', status: 'active' as const },
]

export default function ProcessingSidebar() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-5">
        <h3 className="mb-5 text-lg font-semibold text-white">Processing Status</h3>

        <div className="flex items-center">
          <ul className="min-w-0 flex-1 space-y-3.5">
            {processingTasks.map((task) => (
              <li key={task.label} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      task.status === 'done'
                        ? 'bg-emerald-400'
                        : task.status === 'active'
                          ? 'bg-sky-400'
                          : 'bg-slate-600'
                    }`}
                  />
                  <span
                    className={`text-sm text-nowrap ${task.status === 'pending' ? 'text-slate-500' : 'text-slate-200'}`}
                  >
                    {task.label}
                  </span>
                </span>
                <span
                  className={`shrink-0 text-sm font-medium ${
                    task.status === 'done'
                      ? 'text-emerald-400'
                      : task.status === 'active'
                        ? 'text-slate-200'
                        : 'text-slate-500'
                  }`}
                >
                  {task.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#232D47] bg-[#0B122B]/70">
        <div className="grid grid-cols-2 divide-x divide-y divide-[#1B2540]">
          {recordStats.map((stat) => (
            <div key={stat.label} className="p-5">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-5">
        <h3 className="mb-4 flex items-center gap-1.5 text-base font-semibold text-white">
          <Info className="h-4 w-4 text-teal-400" />
          What&apos;s Happening?
        </h3>

        <ul className="space-y-3.5">
          {activityItems.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5">
              {item.status === 'done' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <span className="flex h-4 w-4 shrink-0 items-center justify-center gap-0.5">
                  <span className="h-1 w-1 rounded-full bg-sky-400" />
                  <span className="h-1 w-1 rounded-full bg-sky-400" />
                  <span className="h-1 w-1 rounded-full bg-sky-400" />
                </span>
              )}
              <span className={`text-sm ${item.status === 'done' ? 'text-slate-300' : 'text-sky-400'}`}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
