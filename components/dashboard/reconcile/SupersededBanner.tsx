import Link from 'next/link'
import { ArrowRight, History } from 'lucide-react'
import type { Report } from '@/types/reports'

export default function SupersededBanner({ supersededBy }: { supersededBy: NonNullable<Report['supersededBy']> }) {
  const latest = supersededBy.reference ?? 'the newer run'
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-500/30 bg-slate-500/10 px-4 py-3 text-sm">
      <span className="flex items-center gap-2 text-slate-300">
        <History className="h-4 w-4 shrink-0 text-slate-400" />
        A newer run of this reconciliation exists, so dashboards use {latest} instead of this one.
      </span>
      <Link
        href={`/dashboard/reconciliation-process/${supersededBy.id}`}
        className="flex items-center gap-1 font-medium text-sky-400 hover:text-sky-300"
      >
        Open {latest}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
