'use client'

import { useRouter } from 'next/navigation'
import { Loader2, RotateCcw } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRerunReport } from '@/lib/hooks/useReports'
import { toast } from '@/lib/toast'

type RerunReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
}

export default function RerunReportDialog({ open, onOpenChange, reportId }: RerunReportDialogProps) {
  const router = useRouter()
  const rerun = useRerunReport()

  const handleRerun = () => {
    rerun.mutate(reportId, {
      onSuccess: ({ id }) => {
        onOpenChange(false)
        // Mock phase only: the stand-in returns the source id. Removed when the rerun slice is wired.
        if (id === reportId) {
          toast.success('Rerun draft created (mock), the real one opens in the wizard')
          return
        }
        router.push(`/dashboard/reconciliation-process/${id}`)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid-cols-1 border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-400/15">
            <RotateCcw className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">Rerun with changes</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Starts a new draft with the same files, column mapping and matching rules.
            </DialogDescription>
          </div>
        </DialogHeader>

        <ul className="space-y-1.5 text-sm text-slate-300">
          <li>• Adjust the rules or mapping, or replace either file with a corrected export.</li>
          <li>• This reconciliation stays exactly as it is, including its reviews and resolutions.</li>
          <li>• The new run starts clean and links back here for comparison.</li>
        </ul>

        <Button
          type="button"
          onClick={handleRerun}
          disabled={rerun.isPending}
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-1 bg-indigo-500 text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {rerun.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {rerun.isPending ? 'Creating rerun draft...' : 'Create rerun draft'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
