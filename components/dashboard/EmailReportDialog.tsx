'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useEmailReport } from '@/lib/hooks/useReports'

type EmailReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
}

export default function EmailReportDialog({ open, onOpenChange, reportId }: EmailReportDialogProps) {
  const [to, setTo] = useState('')
  const emailReport = useEmailReport()

  const handleSubmit = async () => {
    if (!to.trim()) return
    try {
      await emailReport.mutateAsync({ id: reportId, input: { to: to.trim() } })
      setTo('')
      onOpenChange(false)
    } catch {
      // Error already surfaced via toast in useEmailReport.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-[#232D47] bg-[#0E182D] p-4 text-white sm:max-w-xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/15">
            <Mail className="h-6 w-6 text-sky-300" />
          </div>
          <div className="flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">Email Report</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Send a summary of this reconciliation to a recipient.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-slate-400">Recipient email</p>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="jane@company.com"
              className="w-full h-10! rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!to.trim() || emailReport.isPending}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {emailReport.isPending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
