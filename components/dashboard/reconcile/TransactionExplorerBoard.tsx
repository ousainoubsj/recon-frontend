import { Search, SlidersHorizontal } from 'lucide-react'

const columns = ['Reference', 'Date', 'Description', 'Amount', 'Status', 'Source']

const placeholderRows = Array.from({ length: 8 })

export default function TransactionExplorerBoard() {
  return (
    <div className="rounded-2xl border border-[#232D47] bg-[#0E182D]/30 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">All Transactions</h3>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              placeholder="Search transactions"
              className="w-56 rounded-lg border border-[#232D47] bg-[#0A1128] py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
            />
          </div>
          <button
            type="button"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#232D47] px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/5"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
              {columns.map((col) => (
                <th key={col} className="pb-3 pr-4 text-nowrap font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {placeholderRows.map((_, index) => (
              <tr key={index} className="border-t border-[#1B2540]">
                {columns.map((col) => (
                  <td key={col} className="py-3 pr-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#1B2540]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#232D47] pt-4 text-xs text-slate-400">
        <p>Showing placeholder data</p>
        <div className="flex items-center gap-2">
          <button type="button" className="cursor-pointer rounded-md border border-[#232D47] px-2.5 py-1 hover:bg-white/5">
            Previous
          </button>
          <button type="button" className="cursor-pointer rounded-md border border-[#232D47] px-2.5 py-1 hover:bg-white/5">
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
