import { History } from 'lucide-react'
import type { Report } from '@/types/reports'

// Not a link: it sits inside clickable rows (the Reports picker items). The Results banner carries the link.
export default function SupersededBadge({ supersededBy }: { supersededBy: NonNullable<Report['supersededBy']> }) {
  return (
    <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-slate-500/15 px-2 py-0.5 text-xs font-medium text-nowrap text-slate-300">
      <History className="h-3 w-3" />
      Superseded by {supersededBy.reference ?? 'a newer run'}
    </span>
  )
}
