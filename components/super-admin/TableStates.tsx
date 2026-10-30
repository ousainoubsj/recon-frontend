import { Skeleton } from '@/components/ui/skeleton'

export function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2 rounded-lg border border-[#232D47] p-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full bg-white/5" />
      ))}
    </div>
  )
}

export function TableError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-[#232D47] px-4 py-3 text-sm text-rose-300">
      {message}{' '}
      <button type="button" onClick={onRetry} className="cursor-pointer font-medium text-sky-400 hover:underline">
        Retry
      </button>
    </div>
  )
}

export function TableEmpty({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#232D47] py-10 text-center">
      <p className="text-sm font-medium text-slate-200">{message}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  )
}
