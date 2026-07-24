import Image from 'next/image'

export default function ReportsHeader() {
  return (
    <div className="">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports &amp; Export</h1>
          <p className="mt-1 text-sm text-[#A3B2C8]">Create, customize and export reconciliation reports in multiple formats.</p>
        </div>
      </div>
    </div>
  )
}
