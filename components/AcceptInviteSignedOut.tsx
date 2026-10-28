'use client'

import Link from 'next/link'
import { useInvitationPreview } from '@/lib/hooks/useTeam'
import { ROLE_LABELS } from '@/types/team'
import { Heading, PRIMARY_BUTTON, SECONDARY_BUTTON, Spinner } from '@/components/AcceptInviteParts'

// The auth form locks the email to the invited address, and a Google sign-up carries the invitation id so
// the backend refuses a different Google account instead of creating an unrelated one.
export default function AcceptInviteSignedOut({ invitationId }: { invitationId: string }) {
  const { data: preview, isLoading, isError } = useInvitationPreview(invitationId, true)

  if (isLoading) return <Spinner />

  if (isError || !preview) {
    return (
      <div className="relative w-full max-w-xl rounded-2xl p-8">
        <Heading
          title="Invitation not found"
          subtitle="This invitation link is invalid, expired, or has already been used. Ask an admin to send a new one."
        />
      </div>
    )
  }

  const authParams = new URLSearchParams({
    redirect: `/accept-invite/${invitationId}`,
    email: preview.email,
    invitation: invitationId,
  })

  return (
    <div className="relative w-full max-w-xl rounded-2xl p-8">
      <Heading
        title={`Join ${preview.organizationName}`}
        subtitle={`${preview.inviterName} invited you as ${ROLE_LABELS[preview.role ?? 'viewer']}. Sign in or create an account with ${preview.email} to accept.`}
      />
      <div className="mt-8 space-y-3">
        <Link href={`/?${authParams}`} className={PRIMARY_BUTTON}>
          Sign in
        </Link>
        <Link href={`/?${authParams}&mode=signup`} className={SECONDARY_BUTTON}>
          Create an account
        </Link>
      </div>
    </div>
  )
}
