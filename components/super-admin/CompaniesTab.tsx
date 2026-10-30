'use client'

import { useState } from 'react'
import { useCompanies } from '@/lib/hooks/useSuperAdmin'
import type { OrganizationStatus } from '@/types/superAdmin'
import CompaniesTable from './CompaniesTable'
import PrevNextPager from './PrevNextPager'
import { TableEmpty, TableError, TableSkeleton } from './TableStates'

const PAGE_SIZE = 16

type CompaniesTabProps = { q: string; status: OrganizationStatus | undefined; isOwner: boolean }

function emptyCopy(isFiltered: boolean, isOwner: boolean) {
  if (isFiltered) return { message: 'No companies match your filters.', hint: 'Try a different search or status.' }
  if (isOwner) return { message: 'No companies yet.', hint: 'Create your first company to get started.' }
  return { message: 'No companies are assigned to you yet.', hint: 'Ask the platform owner for access.' }
}

// Keyed by its filters in PlatformHome, so a new search or status starts again at the first page.
export default function CompaniesTab({ q, status, isOwner }: CompaniesTabProps) {
  const [offset, setOffset] = useState(0)
  const companies = useCompanies({ q: q || undefined, status, offset, limit: PAGE_SIZE })

  if (companies.isLoading) return <TableSkeleton rows={8} />
  if (companies.isError) return <TableError message="Companies couldn’t be loaded." onRetry={() => companies.refetch()} />
  if (!companies.data?.items.length) return <TableEmpty {...emptyCopy(!!q || !!status, isOwner)} />

  return (
    <>
      <CompaniesTable companies={companies.data.items} />
      <PrevNextPager
        offset={offset}
        limit={PAGE_SIZE}
        total={companies.data.total}
        singular="company"
        plural="companies"
        onOffsetChange={setOffset}
      />
    </>
  )
}
