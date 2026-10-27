'use client'

import { useState } from 'react'
import { Loader2, MessageSquareText } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TruncateTooltip } from '@/components/ui/truncate-tooltip'
import { useResolveRows } from '@/lib/hooks/useReports'
import { toast } from '@/lib/toast'
import ResolutionNoteField from './ResolutionNoteField'

type ExplainBreakDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reportId: string
  rowId: string
  reference: string
}

export default function ExplainBreakDialog({ open, onOpenChange, reportId, rowId, reference }: ExplainBreakDialogProps) {
  const [note, setNote] = useState('')
  const resolveRows = useResolveRows()

  // Same render-time reset as HelpDialog: a fresh open never shows the last row's note.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setNote('')
  }

  const description = `${reference} stays as reconciled; the note records why the break is accepted.`

  const handleSubmit = () => {
    resolveRows.mutate(
      { id: reportId, input: { kind: 'explained', rowIds: [rowId], note: note.trim() } },
      {
        onSuccess: () => {
          toast.success('Break explained')
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid-cols-1 border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-lg">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-400/15">
            <MessageSquareText className="h-6 w-6 text-sky-400" />
          </div>
          <div className="min-w-0 flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">Explain break</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              <TruncateTooltip as="span" className="block truncate" tooltip={description}>
                {description}
              </TruncateTooltip>
            </DialogDescription>
          </div>
        </DialogHeader>

        <ResolutionNoteField value={note} onChange={setNote} placeholder="e.g. Timing difference, clears in the next statement" />

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={resolveRows.isPending || !note.trim()}
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-1 bg-sky-500 text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resolveRows.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {resolveRows.isPending ? 'Saving explanation...' : 'Save explanation'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
