'use client'

import { useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdminCompanies, useCompanies, useSetAdminCompanies } from '@/lib/hooks/useSuperAdmin'
import type { PlatformAdmin } from '@/types/superAdmin'
import StatusBadge from './StatusBadge'
import { DIALOG_CONTENT, INPUT, OUTLINE_BUTTON, PRIMARY_BUTTON } from './classes'

const PICKER_LIMIT = 50

type ManageAdminCompaniesDialogProps = { admin: PlatformAdmin; onOpenChange: (open: boolean) => void }

// Mounted only while open, so the selection starts from the saved assignments each time.
export default function ManageAdminCompaniesDialog({ admin, onOpenChange }: ManageAdminCompaniesDialogProps) {
  const [q, setQ] = useState('')
  // null until the admin changes something: until then the saved assignments are the selection.
  const [edited, setEdited] = useState<Set<string> | null>(null)
  const assigned = useAdminCompanies(admin.id, true)
  const companies = useCompanies({ q: q.trim() || undefined, limit: PICKER_LIMIT })
  const saveCompanies = useSetAdminCompanies(admin.id)

  const selected = edited ?? new Set(assigned.data?.organizationIds ?? [])
  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setEdited(next)
  }

  const save = () => saveCompanies.mutate({ organizationIds: [...selected] }, { onSuccess: () => onOpenChange(false) })

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_CONTENT}>
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-white">Companies for {admin.name}</DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            {selected.size === 0
              ? 'No companies selected: they won’t see or enter any company.'
              : `${selected.size} selected. Removing a company ends their session inside it.`}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies" className={`${INPUT} pl-9`} />
        </div>
        <ScrollArea className="h-72 rounded-lg border border-[#232D47]">
          {assigned.isLoading || companies.isLoading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : (
            <ul>
              {companies.data?.items.map((company) => (
                <li key={company.id} className="border-b border-[#1B2540] last:border-0">
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={selected.has(company.id)}
                      onChange={() => toggle(company.id)}
                      className="h-4 w-4 accent-sky-500"
                    />
                    <span className="flex-1 truncate text-sm text-white">{company.name}</span>
                    <StatusBadge status={company.status} />
                  </label>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        {(companies.data?.total ?? 0) > PICKER_LIMIT && (
          <p className="text-xs text-slate-500">Showing the first {PICKER_LIMIT} matches. Search to find others.</p>
        )}
        <div className="mt-1 flex items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className={OUTLINE_BUTTON}>
            Cancel
          </Button>
          <Button type="button" disabled={!edited || saveCompanies.isPending} onClick={save} className={PRIMARY_BUTTON}>
            {saveCompanies.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveCompanies.isPending ? 'Saving...' : 'Save access'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
