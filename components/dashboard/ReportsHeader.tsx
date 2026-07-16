import Image from 'next/image'

export default function ReportsHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 shrink-0">
          <Image src="/icons/reports.png" alt="" width={64} height={64} className="h-full w-full scale-150 object-contain" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Reports &amp; Export</h1>
          <p className="mt-1 text-sm text-[#A3B2C8]">Create, customize and export reconciliation reports in multiple formats.</p>
        </div>
      </div>
    </div>
  )
}
