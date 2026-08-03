import type { Metadata } from 'next'
import AcceptInviteView from '@/components/AcceptInviteView'
import AuthShell from '@/components/AuthShell'

// Private, per-invitation URL — not something search engines should ever
// index or crawl (see app/robots.ts, which also disallows /accept-invite).
export const metadata: Metadata = {
  title: 'Accept Invitation',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AuthShell>
      <AcceptInviteView invitationId={id} />
    </AuthShell>
  )
}
