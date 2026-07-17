import { ChevronDown, Search } from 'lucide-react'

export default function TeamFilters() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          placeholder="Search by name, email..."
          className="w-full rounded-lg border border-[#232D47] bg-[#0A1128]/60 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
        />
      </div>

      <button
        type="button"
        className="flex cursor-pointer items-center gap-6 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
      >
        All Roles
        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
      </button>

      <button
        type="button"
        className="flex cursor-pointer items-center gap-6 rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
      >
        All Status
        <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
      </button>
    </div>
  )
}
