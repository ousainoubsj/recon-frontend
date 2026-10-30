import Image from 'next/image'

export default function SupportContactCard() {
  return (
    <div className="rounded-xl border border-[#1E2A47] bg-[#0A1128] p-4">
      <div className="flex items-start gap-3">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111C3D]">
          <Image src="/icons/headphones.png" alt="" width={20} height={20} className="h-5 w-5" />
          <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0A1128]" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Need support?</p>
          <p className="text-xs text-slate-400">We&apos;re here to help you.</p>
        </div>
      </div>
      <a
        href="mailto:admin@datafin.info"
        className="mt-3 block text-sm font-medium text-[#1CEAEA] hover:underline"
      >
       Email: admin@datafin.info
      </a>
    </div>
  )
}
