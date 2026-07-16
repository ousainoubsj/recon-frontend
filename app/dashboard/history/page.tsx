import { Clock, SlidersHorizontal } from 'lucide-react'

export default function Page() {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-white">History</h1>
            <p className="mt-1 text-sm text-[#A3B2C8]">Your past reconciliations will show up here.</p>
          </div>

          <div className="flex min-h-100 flex-col items-center justify-center gap-3 rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/15">
              <Clock className="h-7 w-7 text-sky-400" />
            </span>
            <p className="text-sm text-slate-400">This page is coming soon.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#232D47] bg-[#0B122B]/70 p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1B2540] text-slate-300">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <h3 className="text-base font-semibold text-white">Filters</h3>
          </div>
          <p className="mt-4 text-sm text-slate-400">Filtering options will show up here.</p>
        </div>
      </div>
    </div>
  )
}
