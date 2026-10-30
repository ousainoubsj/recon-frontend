'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue'
import { cn } from '@/lib/utils'
import type { OrganizationStatus, PlatformRole } from '@/types/superAdmin'
import AdminsTab from './AdminsTab'
import CompaniesTab from './CompaniesTab'
import PlatformGreeting from './PlatformGreeting'
import { SEARCH_INPUT } from './classes'

type StatusOption = OrganizationStatus | 'all'
const STATUS_LABELS: Record<StatusOption, string> = { all: 'All statuses', active: 'Active', suspended: 'Suspended' }

// A platform admin's /dashboard outside any company, laid out like StaffLedger's: Companies | Platform admins tabs.
export default function PlatformHome({ platformRole }: { platformRole: PlatformRole }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isOwner = platformRole === 'owner'
  const tab = isOwner && searchParams.get('tab') === 'platform-admins' ? 'platform-admins' : 'companies'

  const [companySearch, setCompanySearch] = useState('')
  const [status, setStatus] = useState<StatusOption>('all')
  const [adminSearch, setAdminSearch] = useState('')
  const debouncedCompanySearch = useDebouncedValue(companySearch.trim())
  const debouncedAdminSearch = useDebouncedValue(adminSearch.trim())

  const showTab = (next: typeof tab) => router.replace(next === 'companies' ? pathname : `${pathname}?tab=${next}`)
  const tabClass = (name: typeof tab) =>
    cn(
      'cursor-pointer border-b-2 pb-1 text-sm transition-colors duration-300',
      tab === name ? 'border-[#1CEAEA] text-[#1CEAEA]' : 'border-transparent text-slate-300 hover:text-[#1CEAEA]',
    )

  return (
    <div className="space-y-6 px-6 py-6">
      <PlatformGreeting isOwner={isOwner} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-nowrap items-center gap-3">
            <div className="relative w-full min-w-sm max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              {tab === 'companies' ? (
                <input value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} placeholder="Search companies" className={SEARCH_INPUT} />
              ) : (
                <input value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} placeholder="Search platform admins by name or email" className={SEARCH_INPUT} />
              )}
            </div>
            {tab === 'companies' && (
              <Select value={status} onValueChange={(value) => setStatus(value as StatusOption)}>
                <SelectTrigger className="h-auto! w-fit min-w-30 cursor-pointer rounded-full border border-[#1CEAEA]/40 bg-[#0A1128]/60 px-3 py-1.5 text-sm text-white hover:bg-[#1CEAEA]/10">
                  {STATUS_LABELS[status]}
                </SelectTrigger>
                <SelectContent className="min-w-45">
                  {(Object.keys(STATUS_LABELS) as StatusOption[]).map((option) => (
                    <SelectItem key={option} value={option} className="cursor-pointer py-2 text-sm">
                      {STATUS_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => showTab('companies')} className={tabClass('companies')}>
              Companies
            </button>
            {isOwner && (
              <button type="button" onClick={() => showTab('platform-admins')} className={tabClass('platform-admins')}>
                Platform admins
              </button>
            )}
          </div>
        </div>

        {tab === 'companies' ? (
          <CompaniesTab
            key={`${debouncedCompanySearch}|${status}`}
            q={debouncedCompanySearch}
            status={status === 'all' ? undefined : status}
            isOwner={isOwner}
          />
        ) : (
          <AdminsTab key={debouncedAdminSearch} q={debouncedAdminSearch} />
        )}
      </div>
    </div>
  )
}
