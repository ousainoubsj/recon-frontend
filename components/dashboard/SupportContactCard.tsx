import Image from 'next/image'

export default function SupportContactCard() {
  return (
    <div className="rounded-xl border border-line-subtle bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-active">
          <Image src="/icons/headphones.png" alt="" width={20} height={20} className="h-5 w-5" />
          <span className="absolute -bottom-0.5 -left-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-surface" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">Need support?</p>
          <p className="text-xs text-fg-muted">We&apos;re here to help you.</p>
        </div>
      </div>
      <a
        href="mailto:admin@datafin.info"
        className="mt-3 block text-sm font-medium text-brand-text hover:underline"
      >
       Email: admin@datafin.info
      </a>
    </div>
  )
}
