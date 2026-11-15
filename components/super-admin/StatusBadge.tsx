import { cn } from '@/lib/utils'

// Company and platform-admin status share the same two visible states.
export default function StatusBadge({ status }: { status: 'active' | 'suspended' }) {
  const isActive = status === 'active'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[0.65rem] font-medium',
        isActive ? 'border-success-solid/60 bg-success-solid/10 text-success-soft' : 'border-danger-solid/60 bg-danger-solid/10 text-danger-soft',
      )}
    >
      {isActive ? 'Active' : 'Suspended'}
    </span>
  )
}
