'use client'

import { useState } from 'react'
import { useSetPlatformAdminStatus } from '@/lib/hooks/useSuperAdmin'
import type { PlatformAdmin } from '@/types/superAdmin'
import { ActionsMenu, ActionsMenuItem, ActionsMenuSeparator } from './ActionsMenu'
import ConfirmActionDialog from './ConfirmActionDialog'
import ManageAdminCompaniesDialog from './ManageAdminCompaniesDialog'

type OpenDialog = 'companies' | 'suspend' | 'remove' | null

export default function AdminActionsMenu({ admin }: { admin: PlatformAdmin }) {
  const [openDialog, setOpenDialog] = useState<OpenDialog>(null)
  const setStatus = useSetPlatformAdminStatus()

  const isSuspended = admin.platformStatus === 'suspended'
  const closeDialog = (open: boolean) => setOpenDialog(open ? openDialog : null)

  return (
    <>
      <ActionsMenu>
        <ActionsMenuItem onClick={() => setOpenDialog('companies')}>Manage companies</ActionsMenuItem>
        <ActionsMenuSeparator />
        {isSuspended ? (
          <ActionsMenuItem
            tone="success"
            onClick={() => setStatus.mutate({ userId: admin.id, status: 'active' })}
            isPending={setStatus.isPending}
          >
            {setStatus.isPending ? 'Activating...' : 'Activate'}
          </ActionsMenuItem>
        ) : (
          <ActionsMenuItem tone="danger" onClick={() => setOpenDialog('suspend')}>
            Suspend
          </ActionsMenuItem>
        )}
        <ActionsMenuSeparator />
        <ActionsMenuItem tone="danger" onClick={() => setOpenDialog('remove')}>
          Remove
        </ActionsMenuItem>
      </ActionsMenu>

      {openDialog === 'companies' && <ManageAdminCompaniesDialog admin={admin} onOpenChange={closeDialog} />}
      <ConfirmActionDialog
        open={openDialog === 'suspend'}
        onOpenChange={closeDialog}
        title={`Suspend ${admin.name}?`}
        description="They are signed out everywhere and can’t sign in until activated. Their company access is kept."
        confirmLabel="Suspend admin"
        pendingLabel="Suspending..."
        isPending={setStatus.isPending}
        isDestructive
        onConfirm={() => setStatus.mutate({ userId: admin.id, status: 'suspended' }, { onSuccess: () => setOpenDialog(null) })}
      />
      <ConfirmActionDialog
        open={openDialog === 'remove'}
        onOpenChange={closeDialog}
        title={`Remove ${admin.name}?`}
        description="They permanently lose platform access and every company assignment. This can’t be undone."
        confirmLabel="Remove admin"
        pendingLabel="Removing..."
        isPending={setStatus.isPending}
        isDestructive
        confirmPhrase="REMOVE"
        onConfirm={() => setStatus.mutate({ userId: admin.id, status: 'removed' }, { onSuccess: () => setOpenDialog(null) })}
      />
    </>
  )
}
