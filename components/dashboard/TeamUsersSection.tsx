'use client'

import { useState } from 'react'
import TeamFilters from '@/components/dashboard/TeamFilters'
import TeamInvitationsTable from '@/components/dashboard/TeamInvitationsTable'
import TeamStats from '@/components/dashboard/TeamStats'
import TeamTabs, { type TeamTab } from '@/components/dashboard/TeamTabs'
import TeamUsersTable from '@/components/dashboard/TeamUsersTable'
import { authClient } from '@/lib/auth-client'
import { useInvitations, useTeamMembers, useTeamStats } from '@/lib/hooks/useTeam'
import type { MemberRole, MemberStatus } from '@/types/team'

const PAGE_SIZE = 10
// No count-with-filter endpoint exists server-side — fetch a generous cap of
// filtered members in one shot and paginate client-side over that array,
// rather than server-side offset/limit with no accurate total to page against.
const FETCH_CAP = 100

type TeamUsersSectionProps = {
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function TeamUsersSection({ selectedId, onSelect }: TeamUsersSectionProps) {
  const [activeTab, setActiveTab] = useState<TeamTab>('Users')
  const [q, setQ] = useState('')
  const [role, setRole] = useState<MemberRole | 'all'>('all')
  const [status, setStatus] = useState<MemberStatus | 'all'>('all')
  const [page, setPage] = useState(1)

  const { data: session } = authClient.useSession()
  const { data: stats, isLoading: isStatsLoading } = useTeamStats()
  const { data: members, isLoading: isMembersLoading } = useTeamMembers({
    q: q.trim() || undefined,
    role: role === 'all' ? undefined : role,
    status: status === 'all' ? undefined : status,
    limit: FETCH_CAP,
  })
  const { data: invitations, isLoading: isInvitationsLoading } = useInvitations()

  const pagedMembers = members?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleQChange = (value: string) => {
    setQ(value)
    setPage(1)
  }
  const handleRoleChange = (value: MemberRole | 'all') => {
    setRole(value)
    setPage(1)
  }
  const handleStatusChange = (value: MemberStatus | 'all') => {
    setStatus(value)
    setPage(1)
  }

  return (
    <>
      <TeamTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <TeamStats stats={stats} isLoading={isStatsLoading} onViewInvites={() => setActiveTab('Invitations')} />
      <TeamFilters
        q={q}
        onQChange={handleQChange}
        role={role}
        onRoleChange={handleRoleChange}
        status={status}
        onStatusChange={handleStatusChange}
      />
      {activeTab === 'Users' ? (
        <TeamUsersTable
          members={pagedMembers}
          isLoading={isMembersLoading}
          selectedId={selectedId}
          onSelect={onSelect}
          currentUserId={session?.user.id}
          page={page}
          onPageChange={setPage}
          totalCount={members?.length ?? 0}
          pageSize={PAGE_SIZE}
        />
      ) : (
        <TeamInvitationsTable invitations={invitations} isLoading={isInvitationsLoading} members={members} q={q} role={role} />
      )}
    </>
  )
}
