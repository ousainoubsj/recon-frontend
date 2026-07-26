'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import InviteMember from '@/components/dashboard/InviteMember'
import { authClient } from '@/lib/auth-client'
import { authErrorMessage, toast } from '@/lib/toast'
import type { MemberRole } from '@/types/team'

export default function TeamHeader() {
  const queryClient = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)

  const handleInvite = async ({ email, role }: { email: string; role: MemberRole }) => {
    // Cast: authClient's role type defaults to Better Auth's built-in
    // admin/member/owner literals since our custom roles are only
    // configured server-side (auth.js) — the real values are our own
    // admin/analyst/viewer strings, validated by the backend regardless.
    const { error } = await authClient.organization.inviteMember({ email, role } as Parameters<
      typeof authClient.organization.inviteMember
    >[0])
    if (error) {
      toast.error(authErrorMessage(error, 'Failed to send invitation'))
      return
    }
    queryClient.invalidateQueries({ queryKey: ['team'] })
    queryClient.invalidateQueries({ queryKey: ['auditLogs'] })
    toast.success('Invitation sent')
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="">
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

      <InviteMember open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} />
    </div>
  )
}
