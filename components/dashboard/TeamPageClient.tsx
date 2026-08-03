'use client'

import { useState } from 'react'
import TeamHeader from '@/components/dashboard/TeamHeader'
import TeamUserDetails from '@/components/dashboard/TeamUserDetails'
import TeamUsersSection from '@/components/dashboard/TeamUsersSection'
import { authClient } from '@/lib/auth-client'
import { useTeamMembers } from '@/lib/hooks/useTeam'

export default function TeamPageClient() {
  const { data: session } = authClient.useSession()
  // undefined = no explicit row clicked yet (default to the signed-in user's
  // own member row); a string = explicitly selected via a row click. Derived
  // at render time instead of synced via an effect, so there's no
  // setState-in-effect and no separate "closed" state to manage — the panel
  // always shows someone.
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  // Separate, unfiltered fetch from TeamUsersSection's own filtered/paginated
  // query — needed so the details panel can still resolve the selected user
  // even if the Users table's filters would otherwise exclude them.
  const { data: allMembers, isLoading } = useTeamMembers({ limit: 100 })

  const ownMemberId = allMembers?.find((m) => m.userId === session?.user.id)?.id
  const effectiveSelectedId = selectedId ?? ownMemberId
  const selectedMember = allMembers?.find((m) => m.id === effectiveSelectedId) ?? null

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <TeamHeader />
          <TeamUsersSection onSelect={setSelectedId} />
        </div>

        <TeamUserDetails member={selectedMember} isLoading={isLoading} />
      </div>
    </div>
  )
}
