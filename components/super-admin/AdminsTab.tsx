'use client'

import { useState } from 'react'
import { usePlatformAdmins } from '@/lib/hooks/useSuperAdmin'
import AdminsTable from './AdminsTable'
import PrevNextPager from './PrevNextPager'
import { TableEmpty, TableError, TableSkeleton } from './TableStates'

const PAGE_SIZE = 16

// Rendered for the owner only; keyed by the search in PlatformHome so a new search starts at the first page.
export default function AdminsTab({ q }: { q: string }) {
  const [offset, setOffset] = useState(0)
  const admins = usePlatformAdmins({ q: q || undefined, offset, limit: PAGE_SIZE })

  if (admins.isLoading) return <TableSkeleton rows={4} />
  if (admins.isError) return <TableError message="Platform admins couldn’t be loaded." onRetry={() => admins.refetch()} />
  if (!admins.data?.items.length) {
    return <TableEmpty message="No platform admins match your search." hint="Try a different name or email." />
  }

  return (
    <>
      <AdminsTable admins={admins.data.items} />
      <PrevNextPager offset={offset} limit={PAGE_SIZE} total={admins.data.total} singular="admin" plural="admins" onOffsetChange={setOffset} />
    </>
  )
}
