import ReportBuilder from '@/components/dashboard/ReportBuilder'
import ReportPreviewCard from '@/components/dashboard/ReportPreviewCard'
import ReportsHeader from '@/components/dashboard/ReportsHeader'
import ReportTemplates from '@/components/dashboard/ReportTemplates'

export default function Page() {
  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-6">
          <ReportsHeader />
          <ReportTemplates />
        </div>

        <div className="flex flex-col gap-6">
          <ReportBuilder />
          <ReportPreviewCard />
        </div>
      </div>
    </div>
  )
}
