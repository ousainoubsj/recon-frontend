import Image from 'next/image'
import { PlusIcon } from '@/components/icons'

export default function ReconciliationHeaderMid() {
  return (
    <div className="flex w-full items-start justify-between gap-6">
      <div>
        <div className="mb-3 flex items-start gap-1.5 text-xs font-semibold tracking-wider text-teal-400 uppercase">
          <PlusIcon className="h-3.5 w-3.5" strokeWidth={3} />
          New Reconciliation
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Create a New Reconciliation</h1>
        <p className="mt-3 max-w-md text-sm text-[#BCC5D9]">
          Choose how you want to start. Select an option below to begin comparing your financial datasets.
        </p>
      </div>

      <Image
        src="/images/recon-step-1.png"
        alt=""
        width={614}
        height={410}
        className="hidden h-auto w-full max-w-xs shrink-0 lg:block lg:max-w-sm -mt-14"
      />
    </div>
  )
}
