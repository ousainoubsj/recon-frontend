'use client'

import { useState } from 'react'
import InviteMember from '@/components/dashboard/InviteMember'
import { useDeleteCompany, useEnterCompany, useInviteCompanyUser, usePlatformSession, useSetCompanyStatus } from '@/lib/hooks/useSuperAdmin'
import type { Company } from '@/types/superAdmin'
import { ActionsMenu, ActionsMenuItem, ActionsMenuSeparator } from './ActionsMenu'
import ConfirmActionDialog from './ConfirmActionDialog'
import RenameCompanyDialog from './RenameCompanyDialog'

type OpenDialog = 'invite' | 'rename' | 'suspend' | 'delete' | null

export default function CompanyActionsMenu({ company }: { company: Company }) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const enterCompany = useEnterCompany()
  const inviteUser = useInviteCompanyUser(company.id)
  const setStatus = useSetCompanyStatus()
  const deleteCompany = useDeleteCompany()
  const { data: platform } = usePlatformSession()

  const isSuspended = company.status === 'suspended'
  // Irreversible: the owner only, and only once the company is suspended (the API enforces both).
  const canDelete = platform?.platformRole === 'owner' && isSuspended
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
        {canDelete && (
          <>
            <ActionsMenuSeparator />
            <ActionsMenuItem tone="danger" onClick={() => setOpenDialog('delete')}>
              Delete company
            </ActionsMenuItem>
          </>
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
      <ConfirmActionDialog
        open={openDialog === 'delete'}
        onOpenChange={closeDialog}
        title={`Delete ${company.name}?`}
        description="This permanently deletes the company, its members' accounts, every reconciliation, report, export and file. It can't be undone."
        confirmLabel="Delete company"
        pendingLabel="Deleting..."
        isPending={deleteCompany.isPending}
        isDestructive
        confirmPhrase={company.name}
        onConfirm={() => deleteCompany.mutate(company, { onSuccess: () => setOpenDialog(null) })}
      />
    </>
  )
}
