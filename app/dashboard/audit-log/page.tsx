import AuditHeader from '@/components/dashboard/AuditHeader'
import AuditLogTable from '@/components/dashboard/AuditLogTable'
import AuditSidebar from '@/components/dashboard/AuditSidebar'
import AuditStats from '@/components/dashboard/AuditStats'

export default function Page() {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-6">
          <AuditHeader />
          <AuditStats />
          <AuditLogTable />
        </div>

        <AuditSidebar />
      </div>
    </div>
  )
}
