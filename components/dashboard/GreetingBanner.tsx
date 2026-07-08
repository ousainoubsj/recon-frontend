import Image from 'next/image'
import { Plus, UploadCloud } from 'lucide-react'

export default function GreetingBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#232D47]">
      <Image src="/greeting-banner-bg-2.png" alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-[#050F20]/60" />

      <div className="relative flex min-h-44 flex-col justify-center p-6">
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-white">
          Good Morning, Ousainou
          <Image src="/icons/wave.png" alt="" width={24} height={24} className="h-6 w-6 -rotate-12" />
        </h2>
        <p className="mt-2 text-sm text-slate-400">Here&apos;s what&apos;s happening with your reconciliations today.</p>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-linear-to-r from-emerald-400 via-sky-500 to-indigo-500 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-500/20 transition-all duration-300 hover:opacity-90 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Start New Reconciliation
          </button>

          <button
            type="button"
            className="flex cursor-pointer text-[#A6B6DE] items-center gap-2 rounded-lg border border-[#243A7E] bg-[#0B1028] px-5 py-2.5 text-sm font-medium transition-colors duration-300 hover:bg-white/10 active:scale-95"
          >
            <UploadCloud className="h-4 w-4 text-[#183C7C]" />
            Upload Saved Files
          </button>
        </div>
      </div>

      <span className="absolute right-[10%] top-1/2 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-sky-500 shadow-lg shadow-sky-500/30">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="h-7 w-7">
          <path d="m5 12.5 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
  )
}
