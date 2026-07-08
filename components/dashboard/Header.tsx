import { BellIcon, SearchIcon } from '@/components/icons'

export default function Header() {
  return (
    <header className="flex items-center justify-end gap-4 border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <input
            type="search"
            placeholder="Search"
            className="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="cursor-pointer rounded-full border border-slate-200 p-2 text-slate-500 transition-colors duration-300 hover:bg-slate-50 hover:text-slate-700"
        >
          <BellIcon className="h-5 w-5" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 via-sky-500 to-indigo-500 text-sm font-semibold text-white">
          U
        </div>
      </div>
    </header>
  )
}
