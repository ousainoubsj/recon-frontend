import { cn } from '@/lib/utils'

// Company and platform-admin status share the same two visible states.
export default function StatusBadge({ status }: { status: 'active' | 'suspended' }) {
  const isActive = status === 'active'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[0.65rem] font-medium',
        isActive ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/60 bg-rose-500/10 text-rose-300',
      )}
    >
      {isActive ? 'Active' : 'Suspended'}
    </span>
  )
}
