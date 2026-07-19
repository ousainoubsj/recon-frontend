'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InviteMember from '@/components/dashboard/InviteMember'

export default function TeamHeader() {
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0">
          <Image src="/icons/team.png" alt="" width={64} height={64} className="h-full w-full scale-150 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Team Management</h1>
          <p className="mt-1 text-sm text-[#A3B2C8]">Manage users, roles and permissions across your organization.</p>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => setInviteOpen(true)}
        className="cursor-pointer rounded-md bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 p-4 font-medium text-white shadow-sm transition-all duration-300 active:scale-95"
      >
        <Plus className="h-4 w-4" />
        Invite User
      </Button>

      <InviteMember open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  )
}
