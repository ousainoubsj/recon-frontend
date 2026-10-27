import { Link2, MessageSquareText } from 'lucide-react'
import type { ResolutionKind } from '@/types/reports'

const RESOLUTION_STYLE: Record<ResolutionKind, { label: string; Icon: typeof Link2; className: string }> = {
  matched: { label: 'Matched manually', Icon: Link2, className: 'bg-teal-500/15 text-teal-300' },
  explained: { label: 'Explained', Icon: MessageSquareText, className: 'bg-sky-500/15 text-sky-300' },
}

export default function ResolutionBadge({ kind }: { kind: ResolutionKind }) {
  const { label, Icon, className } = RESOLUTION_STYLE[kind]
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-nowrap ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
