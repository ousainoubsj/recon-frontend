import { Check } from 'lucide-react'

export default function ReconciliationStepper() {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-400 text-emerald-400">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
      <span className="text-white">Upload Files</span>

      <span className="text-emerald-400">&rarr;</span>

      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
        2
      </span>
      <span className="font-semibold text-white">Column Mapping</span>

      <span className="text-slate-600">&rarr;</span>

      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs font-semibold text-slate-300">
        3
      </span>
      <span className="text-slate-300">Processing</span>

      <span className="text-slate-600">&rarr;</span>

      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-700 border border-slate-600 text-xs text-slate-300">
        4
      </span>
      <span className="text-slate-300">Results</span>
            <span className="text-slate-600">&rarr;</span>

            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-700 border border-slate-600 text-xs text-slate-300">
        5
      </span>
      <span className="text-slate-300">Transaction Explorer</span>

    </div>
  )
}
