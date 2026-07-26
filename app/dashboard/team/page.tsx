'use client'

import { useState } from 'react'
import TeamHeader from '@/components/dashboard/TeamHeader'
import TeamUserDetails from '@/components/dashboard/TeamUserDetails'
import TeamUsersSection from '@/components/dashboard/TeamUsersSection'
import { useTeamMembers } from '@/lib/hooks/useTeam'

export default function Page() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Separate, unfiltered fetch from TeamUsersSection's own filtered/paginated
  // query — needed so the details panel can still resolve the selected user
  // even if the Users table's filters would otherwise exclude them.
  const { data: allMembers, isLoading } = useTeamMembers({ limit: 100 })
  const selectedMember = allMembers?.find((m) => m.id === selectedId) ?? null

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-6">
          <TeamHeader />
          <TeamUsersSection selectedId={selectedId} onSelect={setSelectedId} />
        </div>

        <TeamUserDetails member={selectedMember} isLoading={isLoading && !!selectedId} onClose={() => setSelectedId(null)} />
      </div>
    </div>
  )
}
