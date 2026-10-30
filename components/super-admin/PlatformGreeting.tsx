'use client'

import { useState } from 'react'
import Typewriter from 'typewriter-effect'
import { BuildingAddIcon, UserAddIcon } from '@/components/icons'
import { useSession } from '@/lib/auth-client'
import CreateCompanyDialog from './CreateCompanyDialog'
import InvitePlatformAdminDialog from './InvitePlatformAdminDialog'

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function PlatformGreeting({ isOwner }: { isOwner: boolean }) {
  const { data: session } = useSession()
  const [createOpen, setCreateOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const now = new Date()
  const weekday = now.toLocaleDateString('en-GB', { weekday: 'long' })
  const date = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="inline-flex text-3xl font-normal tracking-tight text-white">
          {greetingForHour(now.getHours())},&nbsp;
          <Typewriter
            key={session?.user.name}
            component="span"
            options={{ strings: [session?.user.name ?? ''], autoStart: true, loop: false, delay: 50, deleteSpeed: Infinity, cursor: '' }}
          />
        </h1>
        <p className="text-sm text-slate-400">
          It&apos;s {weekday}, {date}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="group flex cursor-pointer items-center gap-1.5 rounded-full border border-[#232D47] bg-white/5 px-4 py-2 text-sm text-white shadow-sm transition-all duration-300 hover:bg-white/10 active:scale-95"
        >
          <BuildingAddIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
          Add Company
        </button>
        {isOwner && (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="group flex cursor-pointer items-center gap-1.5 rounded-full bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 px-4 py-2 text-sm text-white transition-all duration-300 hover:opacity-90 active:scale-95"
          >
            <UserAddIcon className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" />
            Onboard Admin
          </button>
        )}
      </div>

      <CreateCompanyDialog open={createOpen} onOpenChange={setCreateOpen} />
      {isOwner && <InvitePlatformAdminDialog open={inviteOpen} onOpenChange={setInviteOpen} />}
    </div>
  )
}
