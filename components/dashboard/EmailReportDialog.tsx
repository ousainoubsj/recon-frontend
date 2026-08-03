'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useEmailReport } from '@/lib/hooks/useReports'

type EmailReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
}

export default function EmailReportDialog({ open, onOpenChange, reportId }: EmailReportDialogProps) {
  const [to, setTo] = useState('')
  const emailReport = useEmailReport()
  const isSending = emailReport.isPending

  const recipients = to
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
    .slice(0, 20)

  const handleSubmit = async () => {
    if (!recipients.length) return
    try {
      await emailReport.mutateAsync({ id: reportId, input: { to: recipients } })
      setTo('')
      onOpenChange(false)
    } catch {
      // Error already surfaced via toast in useEmailReport.
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSending && onOpenChange(next)}>
      <DialogContent className="border border-[#232D47] bg-[#0E182D] p-4 text-white sm:max-w-xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Image src="/icons/gmail-icon.png" alt="" width={24} height={24} className="h-6 w-6" />
          </div>
          <div className="flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">Email Report</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Send a summary of this reconciliation to one or more recipients.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-slate-400">Recipient email(s)</p>
            <input
              type="email"
              multiple
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="jane@company.com, sam@company.com"
              disabled={isSending}
              className="w-full h-10! rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA] disabled:cursor-not-allowed disabled:opacity-60"
            />
            <p className="mt-1 text-xs text-slate-500">Comma-separated, up to 20 addresses.</p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
              className="cursor-pointer border-[#232D47] bg-transparent p-4 text-white transition-all duration-300 hover:bg-white/5 active:scale-95 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!recipients.length || isSending}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-linear-to-r from-indigo-500 to-violet-600 p-4 text-sm font-medium text-white shadow-sm transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSending ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
