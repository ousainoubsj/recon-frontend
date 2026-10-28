'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { useAcceptInvitation, useInvitationDetails } from '@/lib/hooks/useTeam'
import { toast } from '@/lib/toast'
import { formatDate } from '@/lib/format'
import { ROLE_LABELS } from '@/types/team'
import { Heading, LINK_BUTTON, PRIMARY_BUTTON, Spinner } from '@/components/AcceptInviteParts'
import AcceptInviteSignedOut from '@/components/AcceptInviteSignedOut'

type AcceptInviteViewProps = {
  invitationId: string
}

export default function AcceptInviteView({ invitationId }: AcceptInviteViewProps) {
  const router = useRouter()
  const { data: session, isPending: isSessionPending } = authClient.useSession()
  const { data: invitation, isLoading: isInvitationLoading, error } = useInvitationDetails(invitationId, !!session)
  const acceptInvitation = useAcceptInvitation()

  const handleAccept = () => {
    acceptInvitation.mutate(invitationId, {
      onSuccess: () => {
        toast.success('Invitation accepted — welcome aboard!')
        router.push('/dashboard')
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to accept invitation'),
    })
  }

  // Signed out, this page shows the invitation again with the invited address to sign in as.
  const handleSignOutAndSwitch = () => authClient.signOut()

  if (isSessionPending || (session && isInvitationLoading)) return <Spinner />

  if (!session) return <AcceptInviteSignedOut invitationId={invitationId} />

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
          {acceptInvitation.isPending ? 'Accepting invitation...' : 'Accept Invitation'}
        </button>
      </div>
    </div>
  )
}
