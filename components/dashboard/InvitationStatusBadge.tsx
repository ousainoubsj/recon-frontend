import { cn } from '@/lib/utils'
import type { Invitation } from '@/types/team'

export type InvitationDisplayStatus = 'pending' | 'expired' | 'canceled' | 'rejected'

const STATUS_STYLE: Record<InvitationDisplayStatus, { label: string; text: string; dot: string }> = {
  pending: { label: 'Pending', text: 'text-violet-400', dot: 'bg-violet-400' },
  expired: { label: 'Expired', text: 'text-slate-400', dot: 'bg-slate-500' },
  canceled: { label: 'Canceled', text: 'text-rose-400', dot: 'bg-rose-400' },
  rejected: { label: 'Declined', text: 'text-amber-400', dot: 'bg-amber-400' },
}

/** Better Auth never flips an expired invitation's status, so expiry is derived here. Accepted ones return null: they're members now. */
export function invitationDisplayStatus(invitation: Invitation): InvitationDisplayStatus | null {
  if (invitation.status === 'accepted') return null
  if (invitation.status === 'pending' && invitation.expiresAt.getTime() < Date.now()) return 'expired'
  return invitation.status
}

export default function InvitationStatusBadge({ status }: { status: InvitationDisplayStatus }) {
  const style = STATUS_STYLE[status]
  return (
    <span className={cn('flex items-center gap-1.5 text-nowrap font-medium', style.text)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {style.label}
    </span>
  )
}
