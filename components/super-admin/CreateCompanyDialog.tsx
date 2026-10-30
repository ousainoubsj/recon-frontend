'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCreateCompany } from '@/lib/hooks/useSuperAdmin'
import { DIALOG_CONTENT, INPUT, OUTLINE_BUTTON, PRIMARY_BUTTON } from './classes'

type CreateCompanyDialogProps = { open: boolean; onOpenChange: (open: boolean) => void }

export default function CreateCompanyDialog({ open, onOpenChange }: CreateCompanyDialogProps) {
  const [name, setName] = useState('')
  const [firstAdminEmail, setFirstAdminEmail] = useState('')
  const createCompany = useCreateCompany()

  const canCreate = name.trim().length > 0 && /\S+@\S+\.\S+/.test(firstAdminEmail)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName('')
      setFirstAdminEmail('')
    }
    onOpenChange(next)
  }

  const handleCreate = () => {
    createCompany.mutate({ name: name.trim(), firstAdminEmail: firstAdminEmail.trim() }, { onSuccess: () => handleOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={DIALOG_CONTENT}>
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-white">New company</DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            The company starts empty. Its first admin gets an invitation email to set it up.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white">Company name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Atlantic Freight Ltd" className={INPUT} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-white">First admin&apos;s email</span>
            <input
              type="email"
              value={firstAdminEmail}
              onChange={(e) => setFirstAdminEmail(e.target.value)}
              placeholder="finance.lead@company.com"
              className={INPUT}
            />
          </label>
        </div>
        <div className="mt-1 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className={OUTLINE_BUTTON}>
            Cancel
          </Button>
          <Button type="button" disabled={!canCreate || createCompany.isPending} onClick={handleCreate} className={PRIMARY_BUTTON}>
            {createCompany.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {createCompany.isPending ? 'Creating company...' : 'Create and send invite'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
