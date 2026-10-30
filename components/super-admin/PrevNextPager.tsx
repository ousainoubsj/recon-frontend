'use client'

type PrevNextPagerProps = {
  offset: number
  limit: number
  total: number
  singular: string
  plural: string
  onOffsetChange: (offset: number) => void
}

const BUTTON =
  'h-8 cursor-pointer rounded-md border border-[#232D47] px-3 text-xs text-slate-200 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40'

// StaffLedger's footer: a count with "page x of y", then Previous / Next.
export default function PrevNextPager({ offset, limit, total, singular, plural, onOffsetChange }: PrevNextPagerProps) {
  const page = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-1">
      <p className="text-sm text-slate-400">
        {total} {total === 1 ? singular : plural}
        {totalPages > 1 && ` — page ${page} of ${totalPages}`}
      </p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onOffsetChange(offset - limit)} disabled={page <= 1} className={BUTTON}>
          Previous
        </button>
        <button type="button" onClick={() => onOffsetChange(offset + limit)} disabled={page >= totalPages} className={BUTTON}>
          Next
        </button>
      </div>
    </div>
  )
}
