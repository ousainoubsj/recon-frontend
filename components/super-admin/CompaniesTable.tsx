'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/format'
import type { Company } from '@/types/superAdmin'
import CompanyActionsMenu from './CompanyActionsMenu'
import InitialsAvatar from './InitialsAvatar'
import StatusBadge from './StatusBadge'
import { TD, TH, TABLE_FRAME, TR_HEAD } from './classes'

export default function CompaniesTable({ companies }: { companies: Company[] }) {
  return (
    <div className={TABLE_FRAME}>
      <ScrollArea className="min-w-0">
        <table className="w-full text-left">
          <thead>
            <tr className={TR_HEAD}>
              <th className={TH}>Name</th>
              <th className={TH}>Members</th>
              <th className={TH}>Reports</th>
              <th className={TH}>Status</th>
              <th className={TH}>Created</th>
              <th className={`${TH} w-25`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-t border-[#1B2540] hover:bg-white/2">
                <td className={`${TD} font-medium text-white`}>
                  <div className="flex items-center gap-2">
                    <InitialsAvatar name={company.name} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{company.name}</span>
                      <span className="text-xs font-normal text-slate-500">{company.slug}</span>
                    </div>
                  </div>
                </td>
                <td className={TD}>{company.memberCount}</td>
                <td className={TD}>{company.reportCount}</td>
                <td className={TD}>
                  <StatusBadge status={company.status} />
                </td>
                <td className={`${TD} text-nowrap`}>{formatDate(company.createdAt)}</td>
                <td className={TD}>
                  <CompanyActionsMenu company={company} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
