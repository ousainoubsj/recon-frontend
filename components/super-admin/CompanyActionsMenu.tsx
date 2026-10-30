'use client'

import { useState } from 'react'
import InviteMember from '@/components/dashboard/InviteMember'
import { useEnterCompany, useInviteCompanyUser, useSetCompanyStatus } from '@/lib/hooks/useSuperAdmin'
import type { Company } from '@/types/superAdmin'
import { ActionsMenu, ActionsMenuItem, ActionsMenuSeparator } from './ActionsMenu'
import ConfirmActionDialog from './ConfirmActionDialog'
import RenameCompanyDialog from './RenameCompanyDialog'

type OpenDialog = 'invite' | 'rename' | 'suspend' | null

export default function CompanyActionsMenu({ company }: { company: Company }) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const enterCompany = useEnterCompany()
  const inviteUser = useInviteCompanyUser(company.id)
  const setStatus = useSetCompanyStatus()

  const isSuspended = company.status === 'suspended'
  const closeDialog = (open: boolean) => setOpenDialog(open ? openDialog : null)

  return (
    <>
      <ActionsMenu>
        <ActionsMenuItem onClick={() => enterCompany.mutate(company.id)} isPending={enterCompany.isPending}>
          {enterCompany.isPending ? 'Entering...' : 'Act as company'}
        </ActionsMenuItem>
        <ActionsMenuItem onClick={() => setOpenDialog('invite')}>Invite user</ActionsMenuItem>
        <ActionsMenuItem onClick={() => setOpenDialog('rename')}>Rename</ActionsMenuItem>
        <ActionsMenuSeparator />
        {isSuspended ? (
          <ActionsMenuItem
            tone="success"
            onClick={() => setStatus.mutate({ id: company.id, status: 'active' })}
            isPending={setStatus.isPending}
          >
            {setStatus.isPending ? 'Activating...' : 'Activate'}
          </ActionsMenuItem>
        ) : (
          <ActionsMenuItem tone="danger" onClick={() => setOpenDialog('suspend')}>
            Suspend
          </ActionsMenuItem>
        )}
      </ActionsMenu>

      <InviteMember
        open={openDialog === 'invite'}
        onOpenChange={closeDialog}
        description={`Send an invitation for someone to join ${company.name}.`}
        onInvite={(invite) => inviteUser.mutateAsync(invite)}
      />
      {openDialog === 'rename' && <RenameCompanyDialog company={company} open onOpenChange={closeDialog} />}
      <ConfirmActionDialog
        open={openDialog === 'suspend'}
        onOpenChange={closeDialog}
        title={`Suspend ${company.name}?`}
        description="Every member is signed out and blocked until the company is activated. Platform admins can still act as it."
        confirmLabel="Suspend company"
        pendingLabel="Suspending..."
        isPending={setStatus.isPending}
        isDestructive
        onConfirm={() => setStatus.mutate({ id: company.id, status: 'suspended' }, { onSuccess: () => setOpenDialog(null) })}
      />
    </>
  )
}
