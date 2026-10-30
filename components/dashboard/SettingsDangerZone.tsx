'use client'

import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/lib/toast'
import { useDeleteOrganization, useUpdateReconciliationDefaults } from '@/lib/hooks/useSettings'

type SettingsDangerZoneProps = {
  onReset?: () => void
  // Deleting needs the admin role; the API refuses everyone else too.
  isAdmin: boolean
}

export default function SettingsDangerZone({ onReset, isAdmin }: SettingsDangerZoneProps) {
  const { data: activeOrg } = authClient.useActiveOrganization()
  const updateReconDefaults = useUpdateReconciliationDefaults()
  const deleteOrganization = useDeleteOrganization()
  const [resetOpen, setResetOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmName, setConfirmName] = useState('')

  const handleReset = async () => {
    try {
      await updateReconDefaults.mutateAsync({
        defaultAmountTolerance: 0.01,
        defaultDateToleranceDays: 3,
      })
      onReset?.()
      toast.success('Reconciliation defaults reset')
      setResetOpen(false)
    } catch {
      // toastApiError already surfaced by the mutation's onError
    }
  }

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-[#0A1121]/40 p-3">
      <h3 className="text-lg font-semibold text-rose-400">Danger Zone</h3>

      <p className="mt-1 text-sm text-slate-400">Reset all reconciliation defaults back to their original.</p>
      <button
        type="button"
        onClick={() => setResetOpen(true)}
        className="mt-2 w-full cursor-pointer rounded-lg border border-rose-500/50 py-2.5 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/10 active:scale-95"
      >
        Reset to Default
      </button>
      <p className="mt-2 text-xs text-slate-500">This action cannot be undone.</p>

      {isAdmin && (
        <>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-rose-500/50 py-2.5 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/10 active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            Delete Organization
          </button>
          <p className="mt-2 text-xs text-slate-500">Permanently delete this organization and every member&apos;s account.</p>
        </>
      )}

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-white">Reset reconciliation defaults?</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              This resets Default Match Tolerance and Default Date Tolerance back to 0.01% and 3 days. Organization
              info and notification settings are not affected.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-1 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetOpen(false)}
              className="cursor-pointer border-[#232D47] bg-transparent p-4 text-white transition-all duration-300 hover:bg-white/5 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              disabled={updateReconDefaults.isPending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md bg-rose-500 p-4 font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateReconDefaults.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {updateReconDefaults.isPending ? 'Resetting defaults...' : 'Reset'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(next) => {
          setDeleteOpen(next)
          if (!next) setConfirmName('')
        }}
      >
        <DialogContent className="border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-rose-400">Delete organization?</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              This permanently deletes {activeOrg?.name ?? 'your organization'}, every member&apos;s account (yours
              included), and every reconciliation, report, export and file. Everyone is signed out. This cannot be
              undone. Type the organization name to confirm.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={activeOrg?.name}
            className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <div className="mt-1 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="cursor-pointer border-[#232D47] bg-transparent p-4 text-white transition-all duration-300 hover:bg-white/5 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => deleteOrganization.mutate()}
              disabled={deleteOrganization.isPending || confirmName !== activeOrg?.name}
              className="flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-md bg-rose-500 p-4 font-medium text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteOrganization.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {deleteOrganization.isPending ? 'Deleting organization...' : 'Delete Organization'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
