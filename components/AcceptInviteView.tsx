'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useAcceptInvitation, useInvitationDetails } from '@/lib/hooks/useTeam'
import { toast } from '@/lib/toast'
import { formatDate } from '@/lib/format'
import { ROLE_LABELS } from '@/types/team'

type AcceptInviteViewProps = {
  invitationId: string
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}

const PRIMARY_BUTTON =
  'flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
const SECONDARY_BUTTON =
  'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-slate-50 active:scale-95'
const LINK_BUTTON = 'w-full cursor-pointer text-center text-sm font-medium text-blue-600 transition-all duration-300 hover:text-blue-700 active:scale-95'

export default function AcceptInviteView({ invitationId }: AcceptInviteViewProps) {
  const router = useRouter()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { data: invitation, isLoading: isInvitationLoading, error } = useInvitationDetails(invitationId, !!session)
  const acceptInvitation = useAcceptInvitation()

  const redirectParam = `/accept-invite/${invitationId}`

  const handleAccept = () => {
    acceptInvitation.mutate(invitationId, {
      onSuccess: () => {
        toast.success('Invitation accepted — welcome aboard!')
        router.push('/dashboard')
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to accept invitation'),
    })
  }

  const handleSignOutAndSwitch = async () => {
    await authClient.signOut()
    router.push(`/?redirect=${encodeURIComponent(redirectParam)}`)
  }

  if (isSessionPending || (session && isInvitationLoading)) {
    return (
      <div className="relative w-full max-w-xl rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="relative w-full max-w-xl rounded-2xl p-8">
        <Heading
          title="You've been invited"
          subtitle="Sign in or create an account using the email address this invitation was sent to, then you'll be brought back here to accept it."
        />
        <div className="mt-8 space-y-3">
          <Link href={`/?redirect=${encodeURIComponent(redirectParam)}`} className={PRIMARY_BUTTON}>
            Sign in
          </Link>
          <Link href={`/?redirect=${encodeURIComponent(redirectParam)}&mode=signup`} className={SECONDARY_BUTTON}>
            Create an account
          </Link>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="relative w-full max-w-xl rounded-2xl p-8">
        <Heading
          title="Invitation not found"
          subtitle={error instanceof Error ? error.message : 'This invitation link is invalid, expired, or has already been used.'}
        />
        <div className="mt-8">
          <button type="button" onClick={handleSignOutAndSwitch} className={LINK_BUTTON}>
            Sign out and try a different account
          </button>
        </div>
      </div>
    )
  }

  if (invitation.status !== 'pending') {
    return (
      <div className="relative w-full max-w-xl rounded-2xl p-8">
        <Heading
          title={invitation.status === 'accepted' ? 'Already accepted' : 'Invitation no longer valid'}
          subtitle={
            invitation.status === 'accepted'
              ? `You've already joined ${invitation.organizationName}.`
              : `This invitation to join ${invitation.organizationName} is no longer valid.`
          }
        />
        <div className="mt-8">
          <Link href="/dashboard" className={PRIMARY_BUTTON}>
            Go to dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (new Date(invitation.expiresAt) < new Date()) {
    return (
      <div className="relative w-full max-w-xl rounded-2xl p-8">
        <Heading
          title="Invitation expired"
          subtitle={`This invitation to join ${invitation.organizationName} expired on ${formatDate(invitation.expiresAt)}. Ask an admin to resend it.`}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-xl rounded-2xl p-8">
      <Heading
        title={`Join ${invitation.organizationName}`}
        subtitle={`${invitation.inviterEmail} invited you to join as ${ROLE_LABELS[invitation.role ?? 'viewer']}.`}
      />
      <div className="mt-8">
        <button type="button" onClick={handleAccept} disabled={acceptInvitation.isPending} className={PRIMARY_BUTTON}>
          {acceptInvitation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {acceptInvitation.isPending ? 'Accepting...' : 'Accept Invitation'}
        </button>
      </div>
    </div>
  )
}
