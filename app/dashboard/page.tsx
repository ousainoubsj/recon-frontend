import Header from '@/components/dashboard/Header'
import { BoltIcon, ChartIcon, DocumentIcon, ShieldIcon, SwapIcon } from '@/components/icons'

const stats = [
  { Icon: SwapIcon, tint: 'bg-emerald-400/10 text-emerald-500', label: 'Reconciled', value: '—' },
  { Icon: ShieldIcon, tint: 'bg-sky-400/10 text-sky-500', label: 'Discrepancies', value: '—' },
  { Icon: BoltIcon, tint: 'bg-violet-400/10 text-violet-500', label: 'Success rate', value: '—' },
  { Icon: DocumentIcon, tint: 'bg-emerald-400/10 text-emerald-500', label: 'Reports generated', value: '—' },
]

export default function Page() {
  return (
    <>
      <Header title="Overview" subtitle="Reconciliation activity across your workspace" />

      <main className="flex-1 space-y-6 px-6 py-8 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ Icon, tint, label, value }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-2xl font-semibold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ChartIcon className="h-6 w-6" />
          </span>
          <p className="text-base font-semibold text-slate-900">No reconciliations yet</p>
          <p className="max-w-sm text-sm text-slate-500">
            Upload your first data sources to start reconciling transactions and see results here.
          </p>
          <button
            type="button"
            className="mt-2 cursor-pointer rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95"
          >
            Start a reconciliation
          </button>
        </div>
      </main>
    </>
  )
}
