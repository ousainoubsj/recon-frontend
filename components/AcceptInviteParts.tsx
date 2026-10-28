import { Loader2 } from 'lucide-react'


export function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="relative w-full max-w-xl rounded-2xl p-8">
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    </div>
  )
}

export const PRIMARY_BUTTON =
  'flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
export const SECONDARY_BUTTON =
  'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95'
export const LINK_BUTTON = 'w-full cursor-pointer text-center text-sm font-medium text-blue-600 transition-all duration-300 hover:text-blue-700 active:scale-95'
