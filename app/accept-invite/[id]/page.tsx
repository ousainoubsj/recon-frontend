import AcceptInviteView from '@/components/AcceptInviteView'
import AuthShell from '@/components/AuthShell'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AuthShell>
      <AcceptInviteView invitationId={id} />
    </AuthShell>
  )
}
