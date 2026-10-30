'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { formatDate } from '@/lib/format'
import type { PlatformAdmin } from '@/types/superAdmin'
import AdminActionsMenu from './AdminActionsMenu'
import InitialsAvatar from './InitialsAvatar'
import StatusBadge from './StatusBadge'
import { TD, TH, TABLE_FRAME, TR_HEAD } from './classes'

export default function AdminsTable({ admins }: { admins: PlatformAdmin[] }) {
  return (
    <div className={TABLE_FRAME}>
      <ScrollArea className="min-w-0">
        <table className="w-full text-left">
          <thead>
            <tr className={TR_HEAD}>
              <th className={TH}>Name</th>
              <th className={TH}>Status</th>
              <th className={TH}>Companies</th>
              <th className={TH}>Created</th>
              <th className={`${TH} w-25`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} className="border-t border-[#1B2540] hover:bg-white/2">
                <td className={`${TD} font-medium text-white`}>
                  <div className="flex items-center gap-2">
                    <InitialsAvatar name={admin.name} image={admin.image} />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">
                        {admin.name}
                        {admin.platformRole === 'owner' && <span className="ml-2 text-[0.65rem] text-sky-300">Owner</span>}
                      </span>
                      <span className="text-xs font-normal text-slate-500">{admin.email}</span>
                    </div>
                  </div>
                </td>
                <td className={TD}>
                  <StatusBadge status={admin.platformStatus} />
                </td>
                <td className={TD}>{admin.platformRole === 'owner' ? 'All' : admin.companyCount}</td>
                <td className={`${TD} text-nowrap`}>{formatDate(admin.createdAt)}</td>
                <td className={TD}>{admin.platformRole === 'admin' && <AdminActionsMenu admin={admin} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
