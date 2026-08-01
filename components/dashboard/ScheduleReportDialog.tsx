'use client'

import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateSchedule } from '@/lib/hooks/useReports'
import type { ReportSections, ScheduleCadence } from '@/types/reports'

const CADENCE_OPTIONS: { key: ScheduleCadence; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
]

type ScheduleReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
  format: 'pdf' | 'xlsx'
  templateId: string | undefined
  sections: ReportSections
}

export default function ScheduleReportDialog({ open, onOpenChange, reportId, format, templateId, sections }: ScheduleReportDialogProps) {
  const [cadence, setCadence] = useState<ScheduleCadence>('weekly')
  const [recipients, setRecipients] = useState('')
  const createSchedule = useCreateSchedule()

  const handleSubmit = async () => {
    const recipientEmails = recipients
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean)
      .slice(0, 20)

    try {
      await createSchedule.mutateAsync({
        id: reportId,
        input: { cadence, format, templateId, sections, recipientEmails: recipientEmails.length ? recipientEmails : undefined },
      })
      setRecipients('')
      onOpenChange(false)
    } catch {
      // Error already surfaced via toast in useCreateSchedule.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-400/15">
            <CalendarClock className="h-6 w-6 text-indigo-300" />
          </div>
          <div className="flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">Schedule Report</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Automatically regenerate this report on a recurring basis.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-2.5">
          <div>
            <p className="mb-2 text-sm text-slate-400">Cadence</p>
            <div className="grid grid-cols-3 gap-2">
              {CADENCE_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCadence(key)}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-300 active:scale-95 ${
                    cadence === key
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                      : 'border-[#232D47] text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-slate-400">Recipients (optional)</p>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="jane@company.com, sam@company.com"
              className="w-full rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
            />
            <p className="mt-1 text-xs text-slate-500">Comma-separated, up to 20 addresses.</p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={createSchedule.isPending}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {createSchedule.isPending ? 'Scheduling…' : 'Schedule'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
