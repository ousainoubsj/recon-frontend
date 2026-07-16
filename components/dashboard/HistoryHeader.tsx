import Image from 'next/image'

export default function HistoryHeader() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 shrink-0">
        <Image
          src="/icons/transaction-history.png"
          alt=""
          width={64}
          height={64}
          className="h-full w-full scale-150 object-contain"
        />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-white">Reconciliation History</h1>
        <p className="mt-1 text-sm text-[#A3B2C8]">View, search and manage all your reconciliation runs in one place.</p>
      </div>
    </div>
  )
}
