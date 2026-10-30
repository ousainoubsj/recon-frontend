'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUpdateCompany } from '@/lib/hooks/useSuperAdmin'
import type { Company } from '@/types/superAdmin'
import { DIALOG_CONTENT, INPUT, OUTLINE_BUTTON, PRIMARY_BUTTON } from './classes'

type RenameCompanyDialogProps = { company: Company; open: boolean; onOpenChange: (open: boolean) => void }

export default function RenameCompanyDialog({ company, open, onOpenChange }: RenameCompanyDialogProps) {
  const [name, setName] = useState(company.name)
  const updateCompany = useUpdateCompany(company.id)

  const trimmed = name.trim()
  const canSave = trimmed.length > 0 && trimmed !== company.name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CONTENT}>
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-white">Rename company</DialogTitle>
        </DialogHeader>
        <input value={name} onChange={(e) => setName(e.target.value)} aria-label="Company name" className={INPUT} />
        <div className="mt-1 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className={OUTLINE_BUTTON}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSave || updateCompany.isPending}
            onClick={() => updateCompany.mutate(trimmed, { onSuccess: () => onOpenChange(false) })}
            className={PRIMARY_BUTTON}
          >
            {updateCompany.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {updateCompany.isPending ? 'Saving...' : 'Save name'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
