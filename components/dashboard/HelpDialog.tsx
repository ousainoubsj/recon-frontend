'use client'

import { useState } from 'react'
import { HelpCircle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useSendHelpRequest } from '@/lib/hooks/useSupport'
import { toast } from '@/lib/toast'

type HelpDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const [message, setMessage] = useState('')
  const sendHelpRequest = useSendHelpRequest()

  // Clears the draft the moment the dialog opens fresh — same render-time
  // adjustment pattern as ProfileDialog's form reset (Header controls `open`
  // directly, so this isn't syncing from its own onOpenChange).
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setMessage('')
  }

  const handleSend = () => {
    const trimmed = message.trim()
    if (!trimmed) return
    sendHelpRequest.mutate(trimmed, {
      onSuccess: () => {
        toast.success("Message sent — we'll get back to you soon")
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-400/15">
            <HelpCircle className="h-6 w-6 text-indigo-400" />
          </div>
          <div className="flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">Need help?</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Describe what you&apos;re running into and our team will get back to you.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What can we help with?"
            rows={5}
            maxLength={4000}
            className="w-full resize-none rounded-lg border border-[#232D47] bg-[#0A1128] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
          />

          <Button
            type="button"
            onClick={handleSend}
            disabled={sendHelpRequest.isPending || !message.trim()}
            className="flex w-full cursor-pointer items-center justify-center gap-2 bg-indigo-500 text-white transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 h-10"
          >
            {sendHelpRequest.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {sendHelpRequest.isPending ? 'Sending...' : 'Send message'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
