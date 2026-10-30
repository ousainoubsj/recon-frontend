'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useInvitePlatformAdmin } from '@/lib/hooks/useSuperAdmin'
import { DIALOG_CONTENT, INPUT, OUTLINE_BUTTON, PRIMARY_BUTTON } from './classes'

type InvitePlatformAdminDialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

export default function InvitePlatformAdminDialog({ open, onOpenChange }: InvitePlatformAdminDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const inviteAdmin = useInvitePlatformAdmin()

  const canInvite = name.trim().length > 0 && /\S+@\S+\.\S+/.test(email)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName('')
      setEmail('')
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={DIALOG_CONTENT}>
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-white">Invite platform admin</DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            They get an email to set a password. They see no companies until you assign some.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Awa Jallow" className={INPUT} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@recon-cil.com" className={INPUT} />
          </label>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className={OUTLINE_BUTTON}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canInvite || inviteAdmin.isPending}
            onClick={() => inviteAdmin.mutate({ name: name.trim(), email: email.trim() }, { onSuccess: () => handleOpenChange(false) })}
            className={PRIMARY_BUTTON}
          >
            {inviteAdmin.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {inviteAdmin.isPending ? 'Sending invite...' : 'Send invite'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
