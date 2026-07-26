'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ROLE_LABELS, ROLE_OPTIONS, type MemberRole } from '@/types/team'

type InviteMemberProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite?: (invite: { email: string; role: MemberRole }) => Promise<void>
}

export default function InviteMember({ open, onOpenChange, onInvite }: InviteMemberProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MemberRole>('viewer')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canInvite = /\S+@\S+\.\S+/.test(email)

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEmail('')
      setRole('viewer')
    }
    onOpenChange(next)
  }

  const handleInvite = async () => {
    if (!canInvite || !onInvite) return
    setIsSubmitting(true)
    try {
      await onInvite({ email, role })
      handleOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border border-[#232D47] bg-[#0E182D] p-3.5 text-white sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400/15">
            <Image src="/icons/invitation.png" alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </div>
          <div className="flex-1 leading-5">
            <DialogTitle className="text-base font-medium text-white">Invite User</DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Send an invitation for someone to join your organization.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <div>
            <p className="mb-1.5 text-sm font-medium text-white">Email Address</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-lg border border-[#232D47] bg-[#0A1128]/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#1CEAEA] focus:outline-none focus:ring-1 focus:ring-[#1CEAEA]"
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-white">Role</p>
            <Select value={role} onValueChange={(value) => setRole(value as MemberRole)}>
              <SelectTrigger className="h-9! cursor-pointer w-full border-[#232D47] bg-[#0A1128]/60 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="cursor-pointer border-[#232D47] bg-transparent p-4 text-white transition-all duration-300 hover:bg-white/5 active:scale-95"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canInvite || isSubmitting}
            onClick={handleInvite}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Send Invite
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
