import { Skeleton } from '@/components/ui/skeleton'

export function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2 rounded-lg border border-line p-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full bg-overlay/5" />
      ))}
    </div>
  )
}

export function TableError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-line px-4 py-3 text-sm text-danger-soft">
      {message}{' '}
      <button type="button" onClick={onRetry} className="cursor-pointer font-medium text-info hover:underline">
        Retry
      </button>
    </div>
  )
}

export function TableEmpty({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line py-10 text-center">
      <p className="text-sm font-medium text-fg-strong">{message}</p>
      <p className="mt-1 text-xs text-fg-muted">{hint}</p>
    </div>
  )
}
