import Image from 'next/image'

export default function HistoryHeader() {
  return (
    <div className="flex items-center ">
      <div>
        <h1 className="text-2xl font-bold text-white">Reconciliation History</h1>
        <p className="mt-1 text-sm text-[#A3B2C8]">View, search and manage all your reconciliation runs in one place.</p>
      </div>
    </div>
  )
}
