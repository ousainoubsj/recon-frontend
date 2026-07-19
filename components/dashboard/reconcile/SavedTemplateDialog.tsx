'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'

type ReconciliationTemplate = {
  id: string
  name: string
  description: string
  rulesCount: number
}

const templates: ReconciliationTemplate[] = [
  { id: 'bank-statement', name: 'Bank Statement Match', description: 'Match bank statements against internal ledger', rulesCount: 4 },
  { id: 'vendor-invoice', name: 'Vendor Invoice Reconciliation', description: 'Match vendor invoices against purchase orders', rulesCount: 3 },
  { id: 'payroll', name: 'Payroll Reconciliation', description: 'Match payroll disbursements against HR records', rulesCount: 5 },
  { id: 'credit-card', name: 'Credit Card Reconciliation', description: 'Match card transactions against statements', rulesCount: 3 },
  { id: 'intercompany', name: 'Intercompany Reconciliation', description: 'Match transactions between related entities', rulesCount: 6 },
]

type SavedTemplateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (template: ReconciliationTemplate) => void
}

export default function SavedTemplateDialog({ open, onOpenChange, onSelect }: SavedTemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-[#232D47] bg-[#0E182D] p-4 text-white sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-400/15">
            <Image src="/icons/saved.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </div>
          <div className="flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">Saved Template</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Use a template with pre-configured matching rules.
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-96">
          <div className="space-y-2 pr-3">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onSelect?.(template)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#232D47] bg-[#111C3D]/60 p-3 text-left transition-colors hover:bg-white/5"
              >
                <div className="min-w-0 flex-1">
                  <TruncateTooltip as="p" className="truncate text-sm font-medium text-white" tooltip={template.name}>
                    {template.name}
                  </TruncateTooltip>
                  <p className="mt-0.5 truncate text-xs text-slate-400">{template.description}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{template.rulesCount} matching rules</p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
