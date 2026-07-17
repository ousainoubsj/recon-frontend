'use client'

import { useState } from 'react'
import TeamFilters from '@/components/dashboard/TeamFilters'
import TeamInvitationsTable from '@/components/dashboard/TeamInvitationsTable'
import TeamStats from '@/components/dashboard/TeamStats'
import TeamTabs, { type TeamTab } from '@/components/dashboard/TeamTabs'
import TeamUsersTable from '@/components/dashboard/TeamUsersTable'

export default function TeamUsersSection() {
  const [activeTab, setActiveTab] = useState<TeamTab>('Users')

  return (
    <>
      <TeamTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <TeamStats />
      <TeamFilters />
      {activeTab === 'Users' ? <TeamUsersTable /> : <TeamInvitationsTable />}
    </>
  )
}
